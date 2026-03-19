import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../user/entities/user.entity';
import { AccountStatus } from '../../user/enums';
import { RegisterDto } from '../dto/register.dto';
import { AuthTokenOutput, OutputAuthDto } from '../dto/output-auth.dto';
import { JwtPayload } from '../types/jwt-payload.type';
import { AUTH_CONFIG_KEY, AuthConfig } from '@/config';
import { CaptchaService } from '../../captcha/captcha.service';
import { LoginDto } from '../dto/login.dto';
import { RequestContext } from '@/common/dtos/request-context.dto';
import { UserProfileRepository, UserRepository } from '../../user/repositories';
import { AuthLoginType } from '../enums';
import { SmsService } from '../../sms/sms.service';
import { SmsScene } from '../../sms/enums';
import { IS_DEV } from '@/common/constants/global';
import { ResetPasswordDto } from '../../user/dto';
import { generateRandomString } from '@/common/utils/utils';

/**
 * 认证服务
 *
 * 负责用户认证、JWT 令牌生成、密码加密等业务逻辑
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 用户注册
   */
  async signUp(dto: RegisterDto): Promise<OutputAuthDto> {
    const isSmsValid = await this.smsService.verifyCode(dto.phone || '', SmsScene.REGISTER, dto.code);
    if (!isSmsValid) {
      throw new UnauthorizedException('短信验证码错误或已过期');
    }
    const savedUser = await this.registerUser(dto);
    return this.generateTokens(savedUser);
  }

  /**
   * 验证用户（用于 Local Strategy）
   */
  async validateUser(phoneOrEmail: string, password: string): Promise<UserEntity | null> {
    // 需要获取密码
    // 因为 password 字段被 @Exclude 了，这里需要使用 query builder 显式选择密码
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .addSelect('user.status')
      .where('user.phone = :phoneOrEmail OR user.email = :phoneOrEmail', { phoneOrEmail })
      .getOne();

    if (!user) {
      return null;
    }

    if (!user.password) {
      throw new UnauthorizedException('未设置密码或用户不存在，请通过短信登录后设置密码');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // 检查账户状态
    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('账户已被冻结或封禁');
    }

    return user;
  }

  /**
   * 用户登录
   */
  async signIn(ctx: RequestContext, dto: LoginDto, captchaId: string): Promise<OutputAuthDto> {
    let user: UserEntity | null = null;
    // 密码登录
    if (dto.type === AuthLoginType.PASSWORD) {
      // 验证图形验证码
      const isCaptchaValid = await this.captchaService.verify(captchaId, dto.captchaCode);
      if (!isCaptchaValid) {
        throw new UnauthorizedException('图形验证码错误或已过期');
      }
      user = await this.validateUser(dto.phoneOrEmail, dto.password);
    } else if (dto.type === AuthLoginType.SMS) {
      // 验证短信验证码

      const isSmsValid = await this.smsService.verifyCode(dto.phoneOrEmail, SmsScene.LOGIN, dto.code);
      if (!isSmsValid) {
        throw new UnauthorizedException('短信验证码错误或已过期');
      }

      user = await this.userRepository.findOne({
        where: { phone: dto.phoneOrEmail },
        withDeleted: true,
      });
      // 没有找到用户，则注册（登录即注册）
      if (!user) {
        const authConfig = this.configService.get(AUTH_CONFIG_KEY) as AuthConfig;
        user = await this.registerUser({
          phone: dto.phoneOrEmail,
          // password: authConfig.defaultPassword,
          password: generateRandomString(18, true), // 随机密码
          username: authConfig.defaultUsername + Date.now().toString(),
          inviteCode: undefined,
        });
      }
    } else {
      throw new BadRequestException('登录类型错误');
    }

    if (!user) {
      throw new UnauthorizedException(
        dto.type === AuthLoginType.PASSWORD ? '账号或密码有误，请重试' : '未找到该用户，请先注册',
      );
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('账户已被冻结或封禁');
    }

    // 更新最后登录时间和 IP
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ctx.ipv4,
    });

    this.logger.log(`用户登录成功: userId=${user.id}`);
    return this.generateTokens(user);
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<AuthTokenOutput> {
    try {
      const authConfig = this.configService.get(AUTH_CONFIG_KEY) as AuthConfig;
      const payload = this.jwtService.verify(refreshToken, {
        secret: authConfig.jwt.refreshSecret,
      });
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      if (user.status !== AccountStatus.ACTIVE) {
        throw new UnauthorizedException('账户已被冻结或封禁');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 用户登出
   */
  async logout(userId: string) {
    // TODO 这里可以实现令牌黑名单机制
    // TODO 当前简化实现，仅记录日志
    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * 短信验证码重置密码
   *
   * 流程：验证短信码 → 查找用户 → 更新密码
   */
  async resetPassword(dto: ResetPasswordDto): Promise<boolean> {
    const account = dto.account.trim();

    // 短信重置仅支持手机号
    if (account.includes('@')) {
      throw new BadRequestException('短信重置密码仅支持手机号');
    }

    // 若提供确认密码，需校验一致性
    if (dto.confirmPassword && dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    // 1. 验证短信验证码
    const isSmsValid = await this.smsService.verifyCode(account, SmsScene.RESET_PASSWORD, dto.code);
    if (!isSmsValid) {
      throw new UnauthorizedException('短信验证码错误或已过期');
    }

    // 2. 查找用户
    const user = await this.userRepository.findByPhone(account);
    if (!user) {
      throw new NotFoundException('该手机号未注册');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('账户已被冻结或封禁');
    }

    // 3. 加密并更新密码
    const authConfig = this.configService.get(AUTH_CONFIG_KEY) as AuthConfig;
    const hashedPassword = await bcrypt.hash(dto.newPassword, authConfig.bcrypt.rounds);

    await this.userRepository.update(user.id, { password: hashedPassword });

    this.logger.log(`密码重置成功: userId=${user.id}`);
    return true;
  }

  /**
   * 根据用户 ID 获取用户（用于 JWT Strategy）
   */
  async validateUserById(userId: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || user.status !== AccountStatus.ACTIVE || !user.isActive) {
      return null;
    }
    return user;
  }

  /** ==================================== LOGIN ==================================== */

  /**
   * 生成访问令牌和刷新令牌
   */
  public generateTokens(user: UserEntity): OutputAuthDto {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      userType: user.userType,
    };

    const authConfig = this.configService.get(AUTH_CONFIG_KEY) as AuthConfig;

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: authConfig.jwt.refreshSecret,
      expiresIn: Number(authConfig.jwt.refreshExpiresIn),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        verificationStatus: user.verificationStatus,
        enterpriseVerificationStatus: user.enterpriseVerificationStatus,
        isVerified: user.isVerified,
        isEnterpriseVerified: user.isEnterpriseVerified,
        creditScore: user.creditScore,
        status: user.status,
      },
    };
  }

  /**
   * 注册用户
   */
  private async registerUser(dto: Omit<RegisterDto, 'code' | 'type'>): Promise<UserEntity> {
    // 验证至少提供手机号或邮箱
    if (!dto.phone && !dto.email) {
      throw new BadRequestException('手机号或邮箱至少提供一个');
    }

    // 检查用户是否已存在
    const whereConditions: FindOptionsWhere<UserEntity>[] = [];
    if (dto.phone) {
      whereConditions.push({ phone: dto.phone });
    }
    if (dto.email) {
      whereConditions.push({ email: dto.email });
    }

    const existingUser = await this.userRepository.findOne({
      where: whereConditions,
    });

    if (existingUser) {
      if (dto.phone && existingUser.phone === dto.phone) {
        throw new ConflictException('该手机号已被注册');
      }
      if (dto.email && existingUser.email === dto.email) {
        throw new ConflictException('该邮箱已被注册');
      }
    }

    // 加密密码
    const authConfig = this.configService.get(AUTH_CONFIG_KEY) as AuthConfig;
    const hashedPassword = await bcrypt.hash(dto.password, authConfig.bcrypt.rounds);

    // 创建用户
    const user = this.userRepository.create({
      phone: dto.phone,
      email: dto.email,
      password: hashedPassword,
      username: dto.username,
    });

    const savedUser = await this.userRepository.save(user);
    const profile = this.userProfileRepository.create({
      userId: savedUser.id,
      nickname: dto.username,
      user: savedUser,
    });
    await this.userProfileRepository.save(profile);
    this.logger.log(`User registered: ${savedUser.id}`);
    return savedUser;
  }
}
