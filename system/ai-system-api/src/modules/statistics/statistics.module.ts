import { Module } from '@nestjs/common';
import { StatisticsService } from './services';
import { AppStatisticsController } from './controllers';
import { RentalOrderModule } from '@/modules/rental-order/rental-order.module';
import { FavoriteModule } from '@/modules/favorite/favorite.module';
import { AssetModule } from '@/modules/asset/asset.module';
import { PaymentModule } from '@/modules/base/payment/payment.module';
import { FinanceModule } from '@/modules/finance/finance.module';

/**
 * 统计模块
 *
 * 提供各种统计数据的查询功能：
 * - 承租方统计数据
 * - 出租方统计数据
 * - 平台统计数据（未来扩展）
 */
@Module({
  imports: [RentalOrderModule, FavoriteModule, AssetModule, PaymentModule, FinanceModule],
  controllers: [AppStatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
