import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ContactEntity } from './entities';

// Repositories
import { ContactRepository } from './repositories';

// Services
import { ContactService } from './services';

// Controllers
import { AppContactController } from './controllers';

/**
 * 地址模块
 *
 * 提供地址相关功能：
 * - 地址创建、更新、删除
 * - 地址列表查询
 * - 默认地址管理
 *
 * @example
 * // App 端地址接口
 * POST   /app/contact                   创建地址
 * GET    /app/contact                  获取我的地址列表
 * GET    /app/contact/:id              获取地址详情
 * GET    /app/contact/default/current  获取默认地址
 * PUT    /app/contact/:id              更新地址
 * DELETE /app/contact/:id              删除地址
 * POST   /app/contact/:id/set-default  设置默认地址
 */
@Module({
  imports: [TypeOrmModule.forFeature([ContactEntity])],
  controllers: [AppContactController],
  providers: [
    // Repositories
    ContactRepository,
    // Services
    ContactService,
  ],
  exports: [
    // Services（供其他模块调用）
    ContactService,
    // Repositories（供扩展使用）
    ContactRepository,
  ],
})
export class ContactModule {}
