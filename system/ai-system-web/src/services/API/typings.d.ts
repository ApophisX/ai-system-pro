declare namespace MyApi {
  type AclControllerCheckMyPermissionV1Params = {
    code: string;
  };

  type AclControllerDeleteRoleV1Params = {
    id: string;
  };

  type AclControllerGetRoleByIdV1Params = {
    id: string;
  };

  type AclControllerUpdateRoleV1Params = {
    id: string;
  };

  type AdminUpdateUserDto = {
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
    /** 头像 */
    avatar?: string;
    /** 手机号 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 用户类型 */
    userType?: "personal" | "enterprise";
    /** 账户状态 */
    status?: "active" | "frozen" | "banned";
    /** 风险等级 */
    riskLevel?: "low" | "medium" | "high";
    /** 信用评分（0-1000） */
    creditScore?: number;
    /** 每天最多可创建的资产数量 */
    maxDailyAssetCreationCount?: number;
    /** 总资产数量限制（0 表示不限制） */
    maxTotalAssetCount?: number;
    /** 最多可创建的资产实例数量 */
    maxTotalAssetInventoryCount?: number;
  };

  type AdminUserControllerApproveEnterpriseVerificationV1Params = {
    userId: string;
  };

  type AdminUserControllerBanUserV1Params = {
    /** 用户 ID */
    userId: string;
  };

  type AdminUserControllerFreezeUserV1Params = {
    /** 用户 ID */
    userId: string;
  };

  type AdminUserControllerGetAdminUserDetailV1Params = {
    /** 用户 ID */
    userId: string;
  };

  type AdminUserControllerGetAdminUserListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字搜索（搜索用户名、昵称、手机号、邮箱） */
    keyword?: string;
    /** 用户类型 */
    userType?: "personal" | "enterprise";
    /** 实名认证状态 */
    verificationStatus?: "unverified" | "verified" | "rejected";
    /** 企业认证状态（用于筛选待审核列表） */
    enterpriseVerificationStatus?: "pending" | "verified" | "rejected";
    /** 账户状态 */
    status?: "active" | "frozen" | "banned";
    /** 风险等级 */
    riskLevel?: "low" | "medium" | "high";
    /** 注册开始时间 */
    startDate?: string;
    /** 注册结束时间 */
    endDate?: string;
    /** 排序字段 */
    sortBy?: "createdAt" | "lastLoginAt" | "creditScore";
    /** 排序方向 */
    sortOrder?: "ASC" | "DESC";
  };

  type AdminUserControllerGetEnterpriseApplicationListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字搜索（用户名、手机、邮箱、企业名称、法人） */
    keyword?: string;
    /** 企业认证状态，不传默认查待审核（pending） */
    enterpriseVerificationStatus?: "pending" | "verified" | "rejected";
    /** 申请/注册开始时间 */
    startDate?: string;
    /** 申请/注册结束时间 */
    endDate?: string;
    /** 排序字段 */
    sortBy?: "createdAt" | "lastLoginAt" | "creditScore";
    /** 排序方向 */
    sortOrder?: "ASC" | "DESC";
  };

  type AdminUserControllerRejectEnterpriseVerificationV1Params = {
    userId: string;
  };

  type AdminUserControllerRevertEnterpriseVerificationToPendingV1Params = {
    userId: string;
  };

  type AdminUserControllerUnbanUserV1Params = {
    /** 用户 ID */
    userId: string;
  };

  type AdminUserControllerUnfreezeUserV1Params = {
    /** 用户 ID */
    userId: string;
  };

  type AdminUserControllerUpdateAdminUserV1Params = {
    /** 用户 ID */
    userId: string;
  };

  type ApiResponseAuthTokenOutput = {
    code: number;
    message: string;
    data: AuthTokenOutput;
  };

  type ApiResponseBoolean = {
    code: number;
    message: string;
    data: boolean;
  };

  type ApiResponseNumber = {
    code: number;
    message: string;
    data: number;
  };

  type ApiResponseOutputAdminUserListItemDtoArray = {
    code: number;
    message: string;
    data: OutputAdminUserListItemDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputAuthDto = {
    code: number;
    message: string;
    data: OutputAuthDto;
  };

  type ApiResponseOutputCaptchaDto = {
    code: number;
    message: string;
    data: OutputCaptchaDto;
  };

  type ApiResponseOutputContactDto = {
    code: number;
    message: string;
    data: OutputContactDto;
  };

  type ApiResponseOutputContactDtoArray = {
    code: number;
    message: string;
    data: OutputContactDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputEnterpriseApplicationListItemDtoArray = {
    code: number;
    message: string;
    data: OutputEnterpriseApplicationListItemDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputFavoriteDto = {
    code: number;
    message: string;
    data: OutputFavoriteDto;
  };

  type ApiResponseOutputFavoriteDtoArray = {
    code: number;
    message: string;
    data: OutputFavoriteDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputMessageDto = {
    code: number;
    message: string;
    data: OutputMessageDto;
  };

  type ApiResponseOutputMessageDtoArray = {
    code: number;
    message: string;
    data: OutputMessageDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputOcrIdCardBackDto = {
    code: number;
    message: string;
    data: OutputOcrIdCardBackDto;
  };

  type ApiResponseOutputOcrIdCardFaceDto = {
    code: number;
    message: string;
    data: OutputOcrIdCardFaceDto;
  };

  type ApiResponseOutputOssCredentialsDto = {
    code: number;
    message: string;
    data: OutputOssCredentialsDto;
  };

  type ApiResponseOutputUnreadCountByTypeDto = {
    code: number;
    message: string;
    data: OutputUnreadCountByTypeDto;
  };

  type ApiResponseOutputUserDetailDto = {
    code: number;
    message: string;
    data: OutputUserDetailDto;
  };

  type ApiResponseOutputUserDto = {
    code: number;
    message: string;
    data: OutputUserDto;
  };

  type ApiResponseOutputUserFriendDto = {
    code: number;
    message: string;
    data: OutputUserFriendDto;
  };

  type ApiResponseOutputUserFriendDtoArray = {
    code: number;
    message: string;
    data: OutputUserFriendDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseString = {
    code: number;
    message: string;
    data: string;
  };

  type AppContactControllerDeleteContactV1Params = {
    /** 地址 ID */
    id: string;
  };

  type AppContactControllerGetContactDetailV1Params = {
    /** 地址 ID */
    id: string;
  };

  type AppContactControllerGetMyContactsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 是否只查询默认地址 */
    isDefault?: boolean;
  };

  type AppContactControllerSetDefaultContactV1Params = {
    /** 地址 ID */
    id: string;
  };

  type AppContactControllerUpdateContactV1Params = {
    /** 地址 ID */
    id: string;
  };

  type AppFavoriteControllerCheckFavoriteV1Params = {
    /** 资产 ID */
    assetId: string;
  };

  type AppFavoriteControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字搜索（搜索资产名称、描述） */
    keyword?: string;
    /** 资产 ID */
    assetId?: string;
  };

  type AppFavoriteControllerRemoveV1Params = {
    /** 资产 ID */
    assetId: string;
  };

  type AppMessageControllerDeleteV1Params = {
    /** 消息 ID */
    id: string;
  };

  type AppMessageControllerGetByIdV1Params = {
    /** 消息 ID */
    id: string;
  };

  type AppMessageControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 消息类型 */
    type?:
      | "SYSTEM"
      | "USER"
      | "ORDER"
      | "VERIFICATION"
      | "PAYMENT"
      | "ASSET"
      | "REVIEW";
    /** 消息状态 */
    status?: "UNREAD" | "READ" | "DELETED";
    /** 关键字搜索（搜索标题、内容） */
    keyword?: string;
    /** 开始日期 */
    startDate?: string;
    /** 结束日期 */
    endDate?: string;
  };

  type AppMessageControllerGetUnreadCountV1Params = {
    type: string;
  };

  type AppMessageControllerMarkAllAsReadV1Params = {
    type: string;
  };

  type AppMessageControllerUpdateV1Params = {
    /** 消息 ID */
    id: string;
  };

  type AssignRoleDto = {
    /** 用户 ID */
    userId: string;
    /** 角色代码 */
    roleCode: string;
    /** 角色生效时间 */
    effectiveFrom?: string;
    /** 角色失效时间 */
    effectiveUntil?: string;
    /** 角色分配来源 */
    source?: string;
  };

  type AuthTokenOutput = {
    /** 访问令牌 */
    accessToken: string;
    /** 刷新令牌 */
    refreshToken: string;
  };

  type BatchDeleteMessageDto = {
    /** 消息 ID 列表 */
    messageIds: string[];
  };

  type BatchUpdateMessageDto = {
    /** 消息 ID 列表 */
    messageIds: string[];
    /** 消息状态 */
    status?: "UNREAD" | "READ" | "DELETED";
  };

  type CreateContactDto = {
    /** 省份名称 */
    province: string;
    /** 省份代码 */
    provinceCode: string;
    /** 城市名称 */
    city: string;
    /** 城市代码 */
    cityCode: string;
    /** 区县名称 */
    district: string;
    /** 区县代码 */
    districtCode: string;
    /** 详细地址 */
    address?: string;
    /** 地址名称 */
    addressName?: string;
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude: number;
    /** 联系人姓名 */
    contactName: string;
    /** 联系电话 */
    contactPhone: string;
    /** 微信号 */
    wechat?: string;
    /** 是否默认地址 */
    isDefault: boolean;
  };

  type CreateFavoriteDto = {
    /** 资产 ID */
    assetId: string;
  };

  type CreateRoleDto = {
    /** 角色代码（唯一标识，只允许字母、数字和下划线） */
    code: string;
    /** 角色名称 */
    name: string;
    /** 角色描述 */
    description?: string;
    /** 是否为默认角色（新用户自动分配） */
    isDefault?: boolean;
    /** 权限代码列表 */
    permissionCodes?: string[];
  };

  type CreateUserFriendDto = {
    /** 好友 ID（要添加的用户 ID） */
    friendId: string;
    /** 备注（可选，用户对好友的备注名称） */
    remark?: string;
  };

  type EnterpriseVerificationDto = {
    /** 企业名称 */
    companyName: string;
    /** 统一社会信用代码 */
    businessLicense: string;
    /** 法人代表姓名 */
    legalRepresentative: string;
    /** 企业地址 */
    companyAddress?: string;
    /** 企业联系电话 */
    companyPhone?: string;
    /** 企业邮箱 */
    companyEmail?: string;
    /** 营业执照照片（必须） */
    businessLicensePhotoUrls: string[];
    /** 附件材料（可选，如补充证明材料等） */
    attachmentUrls?: string[];
  };

  type IdCardOcrDto = {
    /** 图片二进制数据的 base64 编码（不含 data:image/xxx;base64, 前缀也可）或图片 url */
    image?: string;
    /** 身份证正反面类型：face-正面，back-反面 */
    side: "face" | "back";
    /** 是否输出身份证质量分信息（翻拍、复印件、完整度、整体质量、篡改分数） */
    quality_info?: boolean;
  };

  type LoginDto = {
    /** 验证码 登录失败超过3次后，需要输入验证码才能登录 */
    captchaCode: string;
    /** 邀请码（登录即注册时可选，支持商户邀请/用户推广等） */
    inviteCode?: string;
  };

  type OssControllerGetUploadCredentialsV1Params = {
    /** 上传路径前缀（可选），用于限制上传路径 */
    uploadPath?: string;
  };

  type OutputAdminUserListItemDto = {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 用户名 */
    username?: string;
    /** 头像 */
    avatar?: string;
    /** 手机号 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 用户类型：personal（个人）/ enterprise（企业） */
    userType: "personal" | "enterprise";
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: "unverified" | "verified" | "rejected";
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: "pending" | "verified" | "rejected";
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝） */
    faceRecognitionStatus: "unverified" | "verified" | "rejected";
    /** 实名认证时间 */
    verifiedAt?: string;
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 风险等级：low（低）/ medium（中）/ high（高） */
    riskLevel: "low" | "medium" | "high";
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: "active" | "frozen" | "banned";
    /** 可用余额（分） */
    availableBalance: number;
    /** 冻结余额（分） */
    frozenBalance: number;
    /** 最后登录时间 */
    lastLoginAt?: string;
    /** 最后登录 IP */
    lastLoginIp?: string;
    /** 每天最多可创建的资产数量 */
    maxDailyAssetCreationCount: number;
    /** 总资产数量限制（0 表示不限制） */
    maxTotalAssetCount: number;
    /** 最多可创建的资产实例数量 */
    maxTotalAssetInventoryCount: number;
    /** 注册来源 */
    source: string;
    /** 微信 openid */
    wechatOpenid?: string;
    /** 微信 unionid */
    wechatUnionid?: string;
    /** 支付宝 open_id（用于提现打款） */
    alipayOpenid?: string;
    /** 支付宝 unionid */
    alipayUnionid?: string;
    /** 用户资料简要信息 */
    profile?: OutputAdminUserProfileBriefDto;
  };

  type OutputAdminUserProfileBriefDto = {
    /** 昵称 */
    nickname?: string;
    /** 企业名称 */
    companyName?: string;
    /** 法人代表 */
    legalRepresentative?: string;
  };

  type OutputAuthDto = {
    /** 访问令牌 */
    accessToken: string;
    /** 刷新令牌 */
    refreshToken: string;
    /** 用户信息 */
    user: OutputUserInfoDto;
  };

  type OutputCaptchaDto = {
    /** 验证码 ID */
    id: string;
    /** SVG 图片数据（Base64 编码或 SVG 字符串） */
    svg: string;
  };

  type OutputContactDto = {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 省份名称 */
    province: string;
    /** 省份代码 */
    provinceCode: string;
    /** 城市名称 */
    city: string;
    /** 城市代码 */
    cityCode: string;
    /** 区县名称 */
    district: string;
    /** 区县代码 */
    districtCode: string;
    /** 详细地址 */
    address?: string;
    /** 地址名称 */
    addressName?: string;
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude: number;
    /** 用户 ID（地址所属用户） */
    userId: string;
    /** 联系人姓名 */
    contactName: string;
    /** 联系电话 */
    contactPhone: string;
    /** 微信号 */
    wechat?: string;
    /** 邮编 */
    postalCode?: string;
    /** 是否默认地址 */
    isDefault: boolean;
    /** 地址标签（如：家、公司、学校等） */
    label?: string;
  };

  type OutputEnterpriseApplicationListItemDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 用户名 */
    username?: string;
    /** 手机号 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 用户类型：personal（个人）/ enterprise（企业） */
    userType: "personal" | "enterprise";
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: "pending" | "verified" | "rejected";
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: "active" | "frozen" | "banned";
    /** 企业资料简要信息 */
    profile: OutputUserProfileEnterpriseBriefDto;
  };

  type OutputFavoriteDto = {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 用户 ID */
    userId: string;
    /** 资产 ID */
    assetId: string;
  };

  type OutputMessageDto = {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 用户 ID（接收者） */
    userId: string;
    /** 消息类型：SYSTEM（系统消息）/ USER（用户消息）/ ORDER（订单消息）/ VERIFICATION（实名认证消息）/ PAYMENT（支付消息）/ ASSET（资产消息）/ REVIEW（评价消息） */
    type: string;
    /** 消息标题 */
    title: string;
    /** 消息内容 */
    content: string;
    /** 消息状态 */
    status: "UNREAD" | "READ" | "DELETED";
    /** 关联对象 ID（如订单 ID、资产 ID 等） */
    relatedId?: string;
    /** 关联对象类型（如 ORDER、ASSET 等） */
    relatedType?: string;
    /** 扩展信息（JSON 格式） */
    extra?: Record<string, any>;
    /** 阅读时间 */
    readAt?: Record<string, any>;
    /** 是否未读 */
    isUnread: boolean;
    /** 是否已读 */
    isRead: boolean;
  };

  type OutputOcrIdCardBackDto = {
    /** 旋转角度 */
    angle: number;
    /** 配置字符串 */
    config_str: string;
    /** 有效期截止日期 */
    end_date: string;
    /** 是否伪造 */
    is_fake: boolean;
    /** 签发机关 */
    issue: string;
    /** 请求ID */
    request_id: string;
    /** 有效期开始日期 */
    start_date: string;
    /** 是否成功 */
    success: boolean;
  };

  type OutputOcrIdCardFaceDto = {
    /** 是否成功 */
    success: boolean;
    /** 住址 */
    address: string;
    /** 旋转角度 */
    angle: number;
    /** 出生日期 */
    birth: string;
    /** 配置字符串 */
    config_str: string;
    /** 是否伪造 */
    is_fake: boolean;
    /** 姓名 */
    name: string;
    /** 民族 */
    nationality: string;
    /** 身份证号码 */
    num: string;
    /** 请求ID */
    request_id: string;
    /** 性别 */
    sex: string;
  };

  type OutputOssCredentialsDto = {
    /** 临时访问密钥 ID */
    accessKeyId: string;
    /** 临时访问密钥 Secret */
    accessKeySecret: string;
    /** 安全令牌 */
    securityToken: string;
    /** 凭证过期时间（ISO 8601 格式） */
    expiration: string;
    /** OSS 区域 */
    region: string;
    /** OSS Bucket 名称 */
    bucket: string;
    /** OSS Endpoint */
    endpoint: string;
  };

  type OutputPermissionDto = {
    /** 权限 ID */
    id: string;
    /** 权限代码 */
    code: string;
    /** 权限名称 */
    name: string;
    /** 权限描述 */
    description?: string;
    /** 资源类型 */
    resource: string;
    /** 操作动作 */
    action: string;
    /** 权限分组 */
    group?: string;
  };

  type OutputRoleDto = {
    /** 角色 ID */
    id: string;
    /** 角色代码 */
    code: string;
    /** 角色名称 */
    name: string;
    /** 角色描述 */
    description?: string;
    /** 角色类型 */
    type: "system" | "custom";
    /** 是否为默认角色 */
    isDefault: boolean;
    /** 关联权限列表 */
    permissions?: OutputPermissionDto[];
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
  };

  type OutputUnreadCountByTypeDto = {
    /** 系统消息未读数量 */
    system: number;
    /** 订单消息未读数量 */
    order: number;
  };

  type OutputUserBriefDto = {
    /** 主键 ID（UUID） */
    id: string;
    /** 用户名 */
    username?: string;
    /** 头像 */
    avatar?: string;
    /** 用户类型：personal（个人）/ enterprise（企业） */
    userType: "personal" | "enterprise";
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 是否实名认证 */
    isVerified: boolean;
    /** 是否企业认证 */
    isEnterpriseVerified: boolean;
    /** 用户资料 */
    profile: OutputUserProfileBriefDto;
  };

  type OutputUserDetailDto = {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 用户名 */
    username?: string;
    /** 头像 */
    avatar?: string;
    /** 手机号 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 用户类型：personal（个人）/ enterprise（企业） */
    userType: "personal" | "enterprise";
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: "unverified" | "verified" | "rejected";
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: "pending" | "verified" | "rejected";
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝） */
    faceRecognitionStatus: "unverified" | "verified" | "rejected";
    /** 实名认证时间 */
    verifiedAt?: string;
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 风险等级：low（低）/ medium（中）/ high（高） */
    riskLevel: "low" | "medium" | "high";
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: "active" | "frozen" | "banned";
    /** 可用余额（分） */
    availableBalance: number;
    /** 冻结余额（分） */
    frozenBalance: number;
    /** 最后登录时间 */
    lastLoginAt?: string;
    /** 最后登录 IP */
    lastLoginIp?: string;
    /** 每天最多可创建的资产数量 */
    maxDailyAssetCreationCount: number;
    /** 总资产数量限制（0 表示不限制） */
    maxTotalAssetCount: number;
    /** 最多可创建的资产实例数量 */
    maxTotalAssetInventoryCount: number;
    /** 注册来源 */
    source: string;
    /** 微信 openid */
    wechatOpenid?: string;
    /** 微信 unionid */
    wechatUnionid?: string;
    /** 支付宝 open_id（用于提现打款） */
    alipayOpenid?: string;
    /** 支付宝 unionid */
    alipayUnionid?: string;
    /** 是否实名认证 */
    isVerified: boolean;
    /** 是否企业认证 */
    isEnterpriseVerified: boolean;
    /** 用户资料 */
    profile: OutputUserDetailProfileDto;
  };

  type OutputUserDetailProfileDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（自增） */
    id: number;
    /** 省份名称 */
    province?: string;
    /** 省份代码 */
    provinceCode?: string;
    /** 城市名称 */
    city?: string;
    /** 城市代码 */
    cityCode?: string;
    /** 区县名称 */
    district?: string;
    /** 区县代码 */
    districtCode?: string;
    /** 用户 ID */
    userId: string;
    /** 昵称 */
    nickname?: string;
    /** 个人简介 */
    bio?: string;
    /** 真实姓名（实名认证后） */
    realName?: string;
    /** 性别：unknown/male/female */
    gender: "unknown" | "male" | "female";
    /** 生日 */
    birthday?: string;
    /** 身份证照片地址 */
    idCardPhotoUrls?: string[];
    /** 身份证地址 */
    idCardAddress?: string;
    /** 身份证有效期开始日期 */
    idCardStartDate?: string;
    /** 身份证有效期结束日期 */
    idCardEndDate?: string;
    /** 身份证签发机关 */
    idCardIssue?: string;
    /** 身份证详细信息快照 */
    idCardSnapshot?: Record<string, any>;
    /** 个人地址 */
    address?: string;
    /** 企业名称 */
    companyName?: string;
    /** 统一社会信用代码 */
    businessLicense?: string;
    /** 法人代表 */
    legalRepresentative?: string;
    /** 企业地址 */
    companyAddress?: string;
    /** 企业联系电话 */
    companyPhone?: string;
    /** 企业邮箱 */
    companyEmail?: string;
    /** 营业执照照片地址 */
    businessLicensePhotoUrls?: string[];
    /** 附件材料地址 */
    attachmentUrls?: string[];
    /** 紧急联系人（JSON 数组，最多3个，每项含姓名、手机号、关系类型） */
    emergencyContacts?: string[];
    /** 标签（JSON 数组） */
    tags?: string[];
    /** 个人偏好设置（JSON 对象） */
    preferences?: Record<string, any>;
    /** 其他设置（JSON 对象） */
    settings?: Record<string, any>;
    /** 身份证号 */
    idCard: string;
  };

  type OutputUserDto = {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 用户名 */
    username?: string;
    /** 头像 */
    avatar?: string;
    /** 手机号 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 用户类型：personal（个人）/ enterprise（企业） */
    userType: "personal" | "enterprise";
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: "unverified" | "verified" | "rejected";
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: "pending" | "verified" | "rejected";
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝） */
    faceRecognitionStatus: "unverified" | "verified" | "rejected";
    /** 实名认证时间 */
    verifiedAt?: string;
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 风险等级：low（低）/ medium（中）/ high（高） */
    riskLevel: "low" | "medium" | "high";
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: "active" | "frozen" | "banned";
    /** 可用余额（分） */
    availableBalance: number;
    /** 冻结余额（分） */
    frozenBalance: number;
    /** 最后登录时间 */
    lastLoginAt?: string;
    /** 最后登录 IP */
    lastLoginIp?: string;
    /** 每天最多可创建的资产数量 */
    maxDailyAssetCreationCount: number;
    /** 总资产数量限制（0 表示不限制） */
    maxTotalAssetCount: number;
    /** 最多可创建的资产实例数量 */
    maxTotalAssetInventoryCount: number;
    /** 注册来源 */
    source: string;
    /** 微信 openid */
    wechatOpenid?: string;
    /** 微信 unionid */
    wechatUnionid?: string;
    /** 支付宝 open_id（用于提现打款） */
    alipayOpenid?: string;
    /** 支付宝 unionid */
    alipayUnionid?: string;
    /** 用户资料 */
    profile: OutputUserProfileDto;
    /** 是否实名认证 */
    isVerified: boolean;
    /** 是否企业认证 */
    isEnterpriseVerified: boolean;
  };

  type OutputUserFriendDto = {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 用户 ID（发起好友关系的用户） */
    userId: string;
    /** 好友 ID（被添加的用户） */
    friendId: string;
    /** 好友状态：pending（待确认）/ accepted（已接受）/ blocked（已屏蔽） */
    status: "pending" | "accepted" | "blocked";
    /** 申请时间（发送好友请求的时间） */
    appliedAt: string;
    /** 确认时间（对方接受好友请求的时间） */
    acceptedAt?: string;
    /** 好友用户信息 */
    friend?: OutputUserBriefDto;
    /** 当前用户信息（在双向查询时使用） */
    user?: OutputUserBriefDto;
  };

  type OutputUserInfoDto = {
    /** 主键 ID（UUID） */
    id: string;
    /** 用户名 */
    username?: string;
    /** 手机号 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 用户类型：personal（个人）/ enterprise（企业） */
    userType: "personal" | "enterprise";
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: "unverified" | "verified" | "rejected";
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: "pending" | "verified" | "rejected";
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: "active" | "frozen" | "banned";
    /** 是否已完成认证（个人实名或企业认证通过） */
    isVerified: boolean;
    /** 是否企业认证 */
    isEnterpriseVerified: boolean;
  };

  type OutputUserProfileBriefDto = {
    /** 主键 ID（自增） */
    id: number;
    /** 昵称 */
    nickname?: string;
    /** 性别：unknown/male/female */
    gender: "unknown" | "male" | "female";
  };

  type OutputUserProfileDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（自增） */
    id: number;
    /** 省份名称 */
    province?: string;
    /** 省份代码 */
    provinceCode?: string;
    /** 城市名称 */
    city?: string;
    /** 城市代码 */
    cityCode?: string;
    /** 区县名称 */
    district?: string;
    /** 区县代码 */
    districtCode?: string;
    /** 用户 ID */
    userId: string;
    /** 昵称 */
    nickname?: string;
    /** 个人简介 */
    bio?: string;
    /** 真实姓名（实名认证后） */
    realName?: string;
    /** 性别：unknown/male/female */
    gender: "unknown" | "male" | "female";
    /** 生日 */
    birthday?: string;
    /** 身份证地址 */
    idCardAddress?: string;
    /** 身份证有效期开始日期 */
    idCardStartDate?: string;
    /** 身份证有效期结束日期 */
    idCardEndDate?: string;
    /** 身份证签发机关 */
    idCardIssue?: string;
    /** 身份证详细信息快照 */
    idCardSnapshot?: Record<string, any>;
    /** 个人地址 */
    address?: string;
    /** 企业名称 */
    companyName?: string;
    /** 统一社会信用代码 */
    businessLicense?: string;
    /** 法人代表 */
    legalRepresentative?: string;
    /** 企业地址 */
    companyAddress?: string;
    /** 企业联系电话 */
    companyPhone?: string;
    /** 企业邮箱 */
    companyEmail?: string;
    /** 营业执照照片地址 */
    businessLicensePhotoUrls?: string[];
    /** 附件材料地址 */
    attachmentUrls?: string[];
    /** 紧急联系人（JSON 数组，最多3个，每项含姓名、手机号、关系类型） */
    emergencyContacts?: string[];
    /** 标签（JSON 数组） */
    tags?: string[];
    /** 个人偏好设置（JSON 对象） */
    preferences?: Record<string, any>;
    /** 其他设置（JSON 对象） */
    settings?: Record<string, any>;
    /** 身份证号 */
    idCard: string;
  };

  type OutputUserProfileEnterpriseBriefDto = {
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（自增） */
    id: number;
    /** 省份名称 */
    province?: string;
    /** 省份代码 */
    provinceCode?: string;
    /** 城市名称 */
    city?: string;
    /** 城市代码 */
    cityCode?: string;
    /** 区县名称 */
    district?: string;
    /** 区县代码 */
    districtCode?: string;
    /** 用户 ID */
    userId: string;
    /** 昵称 */
    nickname?: string;
    /** 个人简介 */
    bio?: string;
    /** 真实姓名（实名认证后） */
    realName?: string;
    /** 性别：unknown/male/female */
    gender: "unknown" | "male" | "female";
    /** 生日 */
    birthday?: string;
    /** 身份证号（加密存储） */
    idCard?: string;
    /** 身份证照片地址 */
    idCardPhotoUrls?: string[];
    /** 身份证地址 */
    idCardAddress?: string;
    /** 身份证有效期开始日期 */
    idCardStartDate?: string;
    /** 身份证有效期结束日期 */
    idCardEndDate?: string;
    /** 身份证签发机关 */
    idCardIssue?: string;
    /** 身份证详细信息快照 */
    idCardSnapshot?: Record<string, any>;
    /** 个人地址 */
    address?: string;
    /** 企业名称 */
    companyName?: string;
    /** 统一社会信用代码 */
    businessLicense?: string;
    /** 法人代表 */
    legalRepresentative?: string;
    /** 企业地址 */
    companyAddress?: string;
    /** 企业联系电话 */
    companyPhone?: string;
    /** 企业邮箱 */
    companyEmail?: string;
    /** 营业执照照片地址 */
    businessLicensePhotoUrls?: string[];
    /** 附件材料地址 */
    attachmentUrls?: string[];
    /** 紧急联系人（JSON 数组，最多3个，每项含姓名、手机号、关系类型） */
    emergencyContacts?: string[];
    /** 标签（JSON 数组） */
    tags?: string[];
    /** 个人偏好设置（JSON 对象） */
    preferences?: Record<string, any>;
    /** 其他设置（JSON 对象） */
    settings?: Record<string, any>;
  };

  type PaginationMetaDto = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 总数 */
    total: number;
  };

  type RealNameAuthDto = {
    /** 真实姓名 */
    realName: string;
    /** 性别 */
    gender?: "unknown" | "male" | "female";
    /** 生日（YYYY-MM-DD） */
    birthday?: string;
    /** 身份证号 */
    idCard: string;
    /** 身份证照片地址（如正反面） */
    idCardPhotoUrls: string[];
    /** 身份证地址 */
    idCardAddress?: string;
    /** 身份证有效期开始日期（YYYY-MM-DD） */
    idCardStartDate?: string;
    /** 身份证有效期结束日期（YYYY-MM-DD），长期可用 9999-12-31 */
    idCardEndDate?: string;
    /** 身份证签发机关 */
    idCardIssue?: string;
    /** 身份证详细信息快照（如 OCR 或人工补充的扩展信息） */
    idCardSnapshot?: Record<string, any>;
  };

  type RefreshTokenDto = {
    /** 刷新令牌 */
    refreshToken: string;
  };

  type RegisterDto = {
    /** 手机号 */
    phone?: string;
    /** 邮箱 */
    email?: string;
    /** 注册类型 */
    type?: number;
    /** 用户名 */
    username?: string;
    /** 密码 */
    password: string;
    /** 邀请码（可选，支持商户邀请/用户推广等） */
    inviteCode?: string;
    /** 短信验证码 */
    code?: string;
  };

  type RejectEnterpriseVerificationDto = {
    /** 拒绝原因（可选，用于通知用户） */
    reason?: string;
  };

  type RemoveRoleDto = {
    /** 用户 ID */
    userId: string;
    /** 角色代码 */
    roleCode: string;
  };

  type ResetPasswordDto = {
    /** 手机号或邮箱 */
    account: string;
    /** 验证码 */
    code: string;
    /** 新密码 */
    newPassword: string;
    /** 确认新密码 */
    confirmPassword?: string;
  };

  type SendSmsCodeDto = {
    /** 手机号 */
    phoneNumber: string;
    /** 验证码场景 */
    scene: "register" | "reset_password" | "change_password" | "login";
    /** 图形验证码 ID */
    captchaId?: string;
    /** 图形验证码 */
    captchaCode: string;
  };

  type UpdateContactDto = {
    /** 省份名称 */
    province?: string;
    /** 省份代码 */
    provinceCode?: string;
    /** 城市名称 */
    city?: string;
    /** 城市代码 */
    cityCode?: string;
    /** 区县名称 */
    district?: string;
    /** 区县代码 */
    districtCode?: string;
    /** 详细地址 */
    address?: string;
    /** 地址名称 */
    addressName?: string;
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude?: number;
    /** 联系人姓名 */
    contactName?: string;
    /** 联系电话 */
    contactPhone?: string;
    /** 微信号 */
    wechat?: string;
    /** 是否默认地址 */
    isDefault?: boolean;
  };

  type UpdateMessageDto = {
    /** 消息状态 */
    status?: "UNREAD" | "READ" | "DELETED";
  };

  type UpdateRoleDto = {
    /** 角色代码（唯一标识，只允许字母、数字和下划线） */
    code?: string;
    /** 角色名称 */
    name?: string;
    /** 角色描述 */
    description?: string;
    /** 是否为默认角色 */
    isDefault?: boolean;
    /** 权限代码列表（会替换现有权限） */
    permissionCodes?: string[];
  };

  type UpdateUserProfileInfoDto = {
    /** 头像 */
    avatar?: string;
    /** 昵称 */
    nickname?: string;
    /** 性别 */
    gender?: "unknown" | "male" | "female";
    /** 个人简介 */
    bio?: string;
  };

  type UserFriendControllerAcceptFriendRequestV1Params = {
    /** 好友用户 ID */
    friendId: string;
  };

  type UserFriendControllerBlockUserV1Params = {
    /** 要屏蔽的用户 ID */
    friendId: string;
  };

  type UserFriendControllerDeleteFriendV1Params = {
    /** 好友用户 ID */
    friendId: string;
  };

  type UserFriendControllerGetFriendListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 好友状态过滤（pending/accepted/blocked） */
    status?: "pending" | "accepted" | "blocked";
    /** 关键字搜索（搜索好友的用户名或备注） */
    keyword?: string;
  };

  type UserFriendControllerGetFriendRelationV1Params = {
    /** 好友用户 ID */
    friendId: string;
  };

  type UserFriendControllerGetPendingRequestsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 好友状态过滤（pending/accepted/blocked） */
    status?: "pending" | "accepted" | "blocked";
    /** 关键字搜索（搜索好友的用户名或备注） */
    keyword?: string;
  };

  type UserFriendControllerRejectFriendRequestV1Params = {
    /** 好友用户 ID */
    friendId: string;
  };

  type UserFriendControllerUnblockUserV1Params = {
    /** 要取消屏蔽的用户 ID */
    friendId: string;
  };

  type UserFriendControllerUpdateRemarkV1Params = {
    /** 好友用户 ID */
    friendId: string;
  };

  type VerifySmsCodeDto = {
    /** 手机号 */
    phone: string;
    /** 验证码场景 */
    scene: "register" | "reset_password" | "change_password" | "login";
    /** 短信验证码 */
    code: string;
  };

  type WechatMiniProgramSignInByCodeDto = {
    /** 微信小程序 code */
    code: string;
  };

  type WechatMiniProgramSignInDto = {
    /** 微信小程序 login code */
    jsCode: string;
    /** 微信小程序 getPhoneNumber code */
    code: string;
    /** 邀请码（登录即注册时可选，支持商户邀请/用户推广等） */
    inviteCode?: string;
  };
}
