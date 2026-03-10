import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserFriendEntity } from './entities/user-friend.entity';
import { UserRepository, UserProfileRepository, UserFriendRepository } from './repositories';
import { UserFriendService, UserService } from './services';
import { UserFriendController, AppUserController, AdminUserController } from './controllers';
import { OssModule } from '../aliyun-oss/oss.module';

/**
 * 用户模块
 *
 * 负责用户相关的业务逻辑和数据访问
 */
@Module({
  imports: [OssModule, TypeOrmModule.forFeature([UserEntity, UserProfileEntity, UserFriendEntity])],
  controllers: [UserFriendController, AppUserController, AdminUserController],
  providers: [UserRepository, UserProfileRepository, UserFriendRepository, UserFriendService, UserService],
  exports: [TypeOrmModule, UserRepository, UserProfileRepository, UserFriendRepository, UserFriendService, UserService],
})
export class UserModule {}
