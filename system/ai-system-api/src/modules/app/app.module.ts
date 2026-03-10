import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_CONFIGS, ThrottlerConfig } from '@/config';
import { ShareModule } from '@/common/share.module';
import { RedisModule } from '@/infrastructure/redis/redis.module';
import { CacheModule } from '@/infrastructure/cache/cache.module';
import { SequenceNumberModule } from '@/infrastructure/sequence-number/sequence-number.module';
import { CaptchaModule } from '../base/captcha/captcha.module';
import { SmsModule } from '../base/sms/sms.module';
import { HealthModule } from '../base/health/health.module';
import { AclModule } from '../base/acl/acl.module';
import { AssetModule } from '../asset/asset.module';
import { ContactModule } from '../contact/contact.module';
import { FavoriteModule } from '../favorite/favorite.module';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from '@/common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { AuthModule } from '../base/auth/auth.module';
import { OssModule } from '../base/aliyun-oss/oss.module';
import { MessageModule } from '../base/message/message.module';
import { ChatModule } from '../base/chat/chat.module';
import { PaymentModule } from '../base/payment/payment.module';
import { RentalOrderModule } from '../rental-order/rental-order.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { WithdrawModule } from '../withdraw/withdraw.module';
import { RecognitionModule } from '../base/recognition/recognition.module';
import { CreditModule } from '../credit/credit.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { MerchantInviteModule } from '../merchant-invite/merchant-invite.module';
import { ReportModule } from '../report/report.module';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: APP_CONFIGS,
      envFilePath: ['.env.local', '.env'],
    }),
    // Throttler 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const throttlerConfig = configService.get<ThrottlerConfig>('throttler')!;
        return {
          throttlers: [
            {
              ttl: throttlerConfig.ttl, // 时间窗口（毫秒）
              limit: throttlerConfig.limit, // 限制次数
            },
          ],
        };
      },
    }),
    // 共享模块（数据库连接等基础设施）
    ShareModule,
    // 基础设施模块
    RedisModule,
    CacheModule,
    SequenceNumberModule,
    // 基础业务模块
    AuthModule,
    HealthModule,
    CaptchaModule,
    SmsModule,
    OssModule,
    RecognitionModule,
    // ACL 权限控制模块
    AclModule,
    // 资产模块
    AssetModule,
    // 联系人模块
    ContactModule,
    // 收藏模块
    FavoriteModule,
    // 消息中心模块
    MessageModule,
    // 聊天模块
    ChatModule,
    // 支付模块
    PaymentModule,
    // 租赁订单模块
    RentalOrderModule,
    // 统计模块
    StatisticsModule,
    // 提现模块
    WithdrawModule,
    // 信用模块
    CreditModule,
    // 租赁评价模块
    ReviewsModule,
    // 商户邀请裂变模块
    MerchantInviteModule,
    // 举报模块
    ReportModule,
    // 社区模块
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // 全局日志拦截器（先执行）
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // 全局响应转换拦截器（后执行）
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    // 全局 Throttler Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
