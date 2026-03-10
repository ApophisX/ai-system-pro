import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportSpecificationEntity } from './entities';
import { ReportRepository } from './repositories';
import { ReportCreateService, ReportQueryService, ReportHandleService } from './services';
import { AppReportController, AdminReportController } from './controllers';
import { AssetModule } from '../asset/asset.module';
import { OssModule } from '../base/aliyun-oss/oss.module';

/**
 * 举报模块
 *
 * 资产规格信息举报：用户举报、后台审核
 *
 * @example
 * POST   /app/report/specification           用户提交举报
 * GET    /app/report/specification            用户查询自己的举报
 * GET    /admin/report/specification         后台举报列表
 * GET    /admin/report/specification/:id     后台举报详情
 * PUT    /admin/report/specification/:id/handle  处理举报
 */
@Module({
  imports: [OssModule, TypeOrmModule.forFeature([ReportSpecificationEntity]), AssetModule],
  controllers: [AppReportController, AdminReportController],
  providers: [ReportRepository, ReportCreateService, ReportQueryService, ReportHandleService],
  exports: [ReportRepository, ReportCreateService, ReportQueryService, ReportHandleService],
})
export class ReportModule {}
