/**
 * 用户模块 DTO 统一导出
 */

// 输出 DTO（响应）
export {
  OutputUserBriefDto,
  OutputUserProfileDto,
  OutputUserDto,
  OutputUserDetailDto,
  OutputUserPublicDto,
  OutputUserListItemDto,
} from './output-user.dto';

// 创建 DTO（请求 - 创建/注册）
export { CreateUserProfileDto, CreateUserByPhoneDto, CreateUserByEmailDto, CreateUserDto } from './create-user.dto';

// 更新 DTO（请求 - 更新）
export {
  UpdateUserBasicDto,
  UpdateUserProfileDto,
  UpdateUserProfileInfoDto,
  UpdatePasswordDto,
  ResetPasswordDto,
  BindPhoneDto,
  BindEmailDto,
  PersonalVerificationDto,
  EnterpriseVerificationDto,
  RejectEnterpriseVerificationDto,
  UpdateUserDto,
} from './update-user.dto';

// 实名认证 DTO（请求 - 写入 user_profile）
export { RealNameAuthDto } from './real-name-auth.dto';

// 查询 DTO（请求 - 列表/搜索）
export { QueryUserDto, SearchUserDto } from './query-user.dto';

// 好友相关 DTO
export { CreateUserFriendDto } from './create-user-friend.dto';
export { UpdateUserFriendDto } from './update-user-friend.dto';
export { QueryUserFriendDto } from './query-user-friend.dto';
export { OutputUserFriendDto } from './output-user-friend.dto';
