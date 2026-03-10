import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { MessageEntity } from './entities';

// Repositories
import { MessageRepository } from './repositories';

// Services
import { MessageService, MessageNotificationService } from './services';

// Controllers
import { AppMessageController } from './controllers';

/**
 * 消息中心模块
 *
 * 提供消息中心相关功能：
 * - 创建消息
 * - 查询消息列表
 * - 标记已读/未读
 * - 删除消息
 * - 未读消息统计
 *
 * @example
 * // App 端消息接口
 * GET    /app/message                   获取消息列表
 * GET    /app/message/:id               获取消息详情
 * PUT    /app/message/:id               更新消息
 * PUT    /app/message/batch             批量更新消息
 * PUT    /app/message/read-all          标记所有消息为已读
 * DELETE /app/message/:id               删除消息
 * DELETE /app/message/batch             批量删除消息
 * GET    /app/message/unread/count      获取未读消息数量
 * GET    /app/message/unread/count-by-type 获取各类型未读消息数量统计
 */
@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity])],
  controllers: [AppMessageController],
  providers: [MessageRepository, MessageService, MessageNotificationService],
  exports: [MessageService, MessageRepository, MessageNotificationService],
})
export class MessageModule {}
