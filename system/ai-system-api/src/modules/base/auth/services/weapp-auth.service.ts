import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios from 'axios';
import crypto from 'crypto';
import { UserRepository } from '../../user/repositories/user.repository';
import { plainToInstance } from 'class-transformer';
import { AuthService } from './auth.service';
import { WechatMiniProgramSignInDto } from '../dto/login.dto';
import { WECHAT_CONFIG_KEY, WeChatConfig, WeChatMiniProgramConfig } from '@/config/wechat.config';
import { OutputAuthDto } from '../dto/output-auth.dto';
import { UserProfileRepository } from '../../user/repositories';
import { IsNull, Not } from 'typeorm';
import { MerchantInviteEvents } from '@/modules/merchant-invite/events/merchant-invite.events';
import { MerchantInviteRegisterService } from '@/modules/merchant-invite/services';

@Injectable()
export class WeappAuthService {
  private readonly logger = new Logger(WeappAuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepo: UserRepository,
    private readonly userProfileRepo: UserProfileRepository,
    private readonly authService: AuthService,
    private readonly merchantInviteRegister: MerchantInviteRegisterService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    //
  }

  /**
   * 获取微信小程序配置
   */
  private get miniProgramConfig(): WeChatMiniProgramConfig {
    const wechatConfig = this.configService.get<WeChatConfig>(WECHAT_CONFIG_KEY);
    if (!wechatConfig?.miniProgram) {
      throw new Error('微信小程序配置未找到');
    }
    return wechatConfig.miniProgram;
  }

  /**
   * 微信小程序登录 - 通过 code 获取 openid 和 session_key
   */
  async code2Session(code: string): Promise<WeChatAuth.MiniProgramLoginResponse> {
    const url = `https://api.weixin.qq.com/sns/jscode2session`;
    const params = {
      appid: this.miniProgramConfig.appId,
      secret: this.miniProgramConfig.appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    };

    try {
      const response = await axios.get<WeChatAuth.MiniProgramLoginResponse>(url, {
        params,
      });
      if (response.data.errcode) {
        throw new BadRequestException(response.data.errmsg || '微信登录失败');
      }
      return response.data;
    } catch (error: any) {
      this.logger.error('微信小程序登录失败', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.errmsg || '微信登录失败');
    }
  }

  /**
   * 微信小程序登录 - 通过 code 获取 access_token
   */
  async signInByCode(code: string): Promise<OutputAuthDto | null> {
    const result = await this.code2Session(code);
    const { openid, unionid } = result;
    const user = await this.userRepo.findOne({
      where: [
        { wechatOpenid: openid || '', phone: Not(IsNull()) },
        { wechatUnionid: unionid || '', phone: Not(IsNull()) },
      ],
    });
    if (!user) {
      return null;
    }
    const { accessToken, refreshToken } = this.authService.generateTokens(user);
    return plainToInstance(OutputAuthDto, { accessToken, refreshToken, user });
  }

  /**
   * 微信小程序登录 - 通过 code 获取 openid 和 session_key
   */
  async signIn(dto: WechatMiniProgramSignInDto) {
    const inviteCode = dto.inviteCode?.trim();
    if (inviteCode) {
      await this.merchantInviteRegister.validateInviteCode(inviteCode);
    }

    const [result1, result2] = await Promise.all([this.getPhoneNumber(dto.code), this.code2Session(dto.jsCode)]);
    const { phoneNumber } = result1.phone_info;
    const { openid, unionid } = result2;
    let user = await this.userRepo.findOne({
      where: {
        phone: phoneNumber,
      },
    });

    if (user) {
      if (!user.wechatOpenid || !user.wechatUnionid) {
        user.wechatOpenid = openid;
        user.wechatUnionid = unionid;
        user = await this.userRepo.save(user);
      }
    } else {
      const newUser = this.userRepo.create({
        username: phoneNumber,
        phone: phoneNumber,
        source: 'weapp',
        wechatOpenid: openid,
        wechatUnionid: unionid,
      });
      user = await this.userRepo.save(newUser);
      const profile = this.userProfileRepo.create({
        userId: user.id,
        nickname: `租友`,
        user: user,
      });
      await this.userProfileRepo.save(profile);

      if (inviteCode) {
        this.eventEmitter.emit(MerchantInviteEvents.USER_REGISTERED_WITH_INVITE, {
          userId: user.id,
          inviteCode,
        });
      }
    }
    const { accessToken, refreshToken } = this.authService.generateTokens(user);
    return plainToInstance(OutputAuthDto, { accessToken, refreshToken, user });
  }

  /**
   * 获取微信小程序 access_token
   */
  async getAccessToken(): Promise<string> {
    const url = `https://api.weixin.qq.com/cgi-bin/token`;
    const params = {
      grant_type: 'client_credential',
      appid: this.miniProgramConfig.appId,
      secret: this.miniProgramConfig.appSecret,
    };

    try {
      const response = await axios.get<WeChatAuth.AccessTokenResponse>(url, {
        params,
      });
      if (response.data.errcode) {
        throw new BadRequestException(response.data.errmsg || '获取 access_token 失败');
      }
      return response.data.access_token;
    } catch (error: any) {
      this.logger.error('获取 access_token 失败', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.errmsg || '获取 access_token 失败');
    }
  }

  /**
   * 解密微信小程序用户信息
   */
  decryptUserInfo(encryptedData: string, iv: string, sessionKey: string): WeChatAuth.DecryptedUserInfo {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        Buffer.from(sessionKey, 'base64'),
        Buffer.from(iv, 'base64'),
      );
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      this.logger.error('解密用户信息失败', error);
      throw new BadRequestException('解密用户信息失败');
    }
  }

  /**
   * 获取微信小程序手机号
   */
  async getPhoneNumber(code: string): Promise<WeChatAuth.PhoneNumberResponse> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;

    try {
      const response = await axios.post<WeChatAuth.PhoneNumberResponse>(url, {
        code,
      });
      if (response.data.errcode !== 0) {
        throw new BadRequestException(response.data.errmsg || '获取手机号失败');
      }
      return response.data;
    } catch (error: any) {
      this.logger.error('获取手机号失败', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.errmsg || '获取手机号失败');
    }
  }
}
