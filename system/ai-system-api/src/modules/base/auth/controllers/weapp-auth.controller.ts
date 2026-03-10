import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WeappAuthService } from '../services/weapp-auth.service';
import { NoAuth } from '@/common/decorators/no-auth.decorator';
import { WechatMiniProgramSignInByCodeDto, WechatMiniProgramSignInDto } from '../dto/login.dto';
import { OutputAuthDto } from '../dto/output-auth.dto';
import { SwaggerApiResponse } from '@/common/decorators/swagger-api-response.decorator';

@ApiTags('WeappAuth')
@Controller('weapp/auth')
export class WeappAuthController {
  constructor(private readonly service: WeappAuthService) {
    //
  }

  @Post('signInByCode')
  @NoAuth()
  @ApiOperation({ summary: '微信小程序登录 - 通过 code 获取 access_token' })
  @SwaggerApiResponse(OutputAuthDto, { description: '微信小程序登录' })
  async signInByCode(@Body() body: WechatMiniProgramSignInByCodeDto) {
    const result = await this.service.signInByCode(body.code);
    return { data: result };
  }

  @Post('sign-in')
  @NoAuth()
  @ApiOperation({ summary: '微信小程序手机号登录登录' })
  @SwaggerApiResponse(OutputAuthDto, { description: '微信小程序登录' })
  async signIn(@Body() body: WechatMiniProgramSignInDto) {
    const result = await this.service.signIn(body);
    return { data: result };
  }
}
