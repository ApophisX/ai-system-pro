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

  type AdminAssetCategoryControllerDeleteV1Params = {
    /** 分类 ID */
    id: string;
  };

  type AdminAssetCategoryControllerGetByIdV1Params = {
    /** 分类 ID */
    id: string;
  };

  type AdminAssetCategoryControllerGetChildrenV1Params = {
    /** 父分类 ID */
    id: string;
    /** 是否只获取有效的分类 */
    isActiveOnly?: boolean;
  };

  type AdminAssetCategoryControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字搜索（搜索分类名称或代码） */
    keyword?: string;
    /** 父分类 ID（传 "root" 或不传表示查询根分类） */
    parentId?: string;
    /** 是否只查询有效的分类 */
    isActive?: boolean;
  };

  type AdminAssetCategoryControllerGetRootsV1Params = {
    /** 是否只获取有效的分类 */
    isActiveOnly?: boolean;
  };

  type AdminAssetCategoryControllerGetTreeV1Params = {
    /** 是否只获取有效的分类 */
    isActiveOnly?: boolean;
  };

  type AdminAssetCategoryControllerUpdateV1Params = {
    /** 分类 ID */
    id: string;
  };

  type AdminAssetControllerAuditV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AdminAssetControllerForceOfflineV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AdminAssetControllerGetByIdV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AdminAssetControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 出租方/商家 ID */
    ownerId?: string;
    /** 资产状态 */
    status?: 'draft' | 'available' | 'offline';
    /** 审核状态 */
    auditStatus?: 'pending' | 'auditing' | 'approved' | 'rejected';
    /** 分类 ID */
    categoryId?: string;
  };

  type AdminCommunityControllerApproveV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AdminCommunityControllerForceCloseV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AdminCommunityControllerGetDetailV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AdminCommunityControllerGetListV1Params = {
    /** 关键字搜索（社区名称、描述） */
    keyword?: string;
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 社区类型 */
    type?: 'public' | 'private';
    /** 仅已加入 */
    joined?: boolean;
    /** 排序字段 */
    sort?: 'memberCount' | 'assetCount' | 'createdAt';
    /** 排序方向 */
    order?: 'asc' | 'desc';
    /** 社区状态 */
    status?: 'pending' | 'approved' | 'rejected' | 'closed';
  };

  type AdminCommunityControllerRejectV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AdminDepositDeductionControllerGetByIdV1Params = {
    /** 扣款记录 ID */
    id: string;
  };

  type AdminDepositDeductionControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 扣款状态筛选 */
    status?:
      | 'pending_user_confirm'
      | 'pending_audit'
      | 'platform_approved'
      | 'platform_rejected'
      | 'executed'
      | 'cancelled';
    /** 订单 ID */
    orderId?: string;
    /** 扣款单号 */
    deductionNo?: string;
    /** 押金单号 */
    depositNo?: string;
  };

  type AdminDepositDeductionControllerReviewV1Params = {
    /** 扣款记录 ID */
    id: string;
  };

  type AdminMerchantInviteControllerGetRankV1Params = {
    /** 周期：monthly | quarterly | yearly */
    period?: string;
    /** 年份 */
    year?: number;
    /** 月份（period=monthly 时有效） */
    month?: number;
    /** 返回条数 */
    limit?: number;
  };

  type AdminRentalReviewControllerApproveV1Params = {
    /** 评价 ID */
    id: string;
  };

  type AdminRentalReviewControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 评价状态 */
    status?: 'pending' | 'approved' | 'rejected' | 'hidden';
    /** 资产 ID */
    assetId?: string;
    /** 出租方 ID */
    lessorId?: string;
    /** 评分筛选：all-全部 / good-好评(4-5) / medium-中评(3) / bad-差评(1-2) / withImage-有图 */
    scoreRange?: 'all' | 'good' | 'medium' | 'bad' | 'withImage';
  };

  type AdminRentalReviewControllerHideV1Params = {
    /** 评价 ID */
    id: string;
  };

  type AdminRentalReviewControllerRejectV1Params = {
    /** 评价 ID */
    id: string;
  };

  type AdminReportControllerGetByIdV1Params = {
    /** 举报 ID */
    id: number;
  };

  type AdminReportControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 资产 ID 筛选 */
    assetId?: string;
    /** 举报原因筛选 */
    reason?: string;
    /** 状态筛选 */
    status?: 0 | 1 | 2 | 3;
    /** 举报人 ID 筛选 */
    reporterId?: string;
    /** 开始日期 (ISO 8601) */
    startDate?: string;
    /** 结束日期 (ISO 8601) */
    endDate?: string;
  };

  type AdminReportControllerHandleV1Params = {
    /** 举报 ID */
    id: number;
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
    userType?: 'personal' | 'enterprise';
    /** 账户状态 */
    status?: 'active' | 'frozen' | 'banned';
    /** 风险等级 */
    riskLevel?: 'low' | 'medium' | 'high';
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
    userType?: 'personal' | 'enterprise';
    /** 实名认证状态 */
    verificationStatus?: 'unverified' | 'verified' | 'rejected';
    /** 企业认证状态（用于筛选待审核列表） */
    enterpriseVerificationStatus?: 'pending' | 'verified' | 'rejected';
    /** 账户状态 */
    status?: 'active' | 'frozen' | 'banned';
    /** 风险等级 */
    riskLevel?: 'low' | 'medium' | 'high';
    /** 注册开始时间 */
    startDate?: string;
    /** 注册结束时间 */
    endDate?: string;
    /** 排序字段 */
    sortBy?: 'createdAt' | 'lastLoginAt' | 'creditScore';
    /** 排序方向 */
    sortOrder?: 'ASC' | 'DESC';
  };

  type AdminUserControllerGetEnterpriseApplicationListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字搜索（用户名、手机、邮箱、企业名称、法人） */
    keyword?: string;
    /** 企业认证状态，不传默认查待审核（pending） */
    enterpriseVerificationStatus?: 'pending' | 'verified' | 'rejected';
    /** 申请/注册开始时间 */
    startDate?: string;
    /** 申请/注册结束时间 */
    endDate?: string;
    /** 排序字段 */
    sortBy?: 'createdAt' | 'lastLoginAt' | 'creditScore';
    /** 排序方向 */
    sortOrder?: 'ASC' | 'DESC';
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

  type AdminWithdrawControllerReviewV1Params = {
    id: string;
  };

  type ApiResponseAppOutputAssetCategoryDto = {
    code: number;
    message: string;
    data: AppOutputAssetCategoryDto;
  };

  type ApiResponseAppOutputAssetCategoryDtoArray = {
    code: number;
    message: string;
    data: AppOutputAssetCategoryDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseAppOutputAssetCategoryTreeDtoArray = {
    code: number;
    message: string;
    data: AppOutputAssetCategoryTreeDto[];
    meta: PaginationMetaDto;
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

  type ApiResponseOutputAssetAdminDetailDto = {
    code: number;
    message: string;
    data: OutputAssetAdminDetailDto;
  };

  type ApiResponseOutputAssetAdminListItemDtoArray = {
    code: number;
    message: string;
    data: OutputAssetAdminListItemDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputAssetCategoryDetailDto = {
    code: number;
    message: string;
    data: OutputAssetCategoryDetailDto;
  };

  type ApiResponseOutputAssetCategoryDtoArray = {
    code: number;
    message: string;
    data: OutputAssetCategoryDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputAssetCategoryTreeDtoArray = {
    code: number;
    message: string;
    data: OutputAssetCategoryTreeDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputAssetCommentDto = {
    code: number;
    message: string;
    data: OutputAssetCommentDto;
  };

  type ApiResponseOutputAssetCommentDtoArray = {
    code: number;
    message: string;
    data: OutputAssetCommentDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputAssetCreationStatsDto = {
    code: number;
    message: string;
    data: OutputAssetCreationStatsDto;
  };

  type ApiResponseOutputAssetDetailDto = {
    code: number;
    message: string;
    data: OutputAssetDetailDto;
  };

  type ApiResponseOutputAssetInventoryDto = {
    code: number;
    message: string;
    data: OutputAssetInventoryDto;
  };

  type ApiResponseOutputAssetInventoryDtoArray = {
    code: number;
    message: string;
    data: OutputAssetInventoryDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputAssetListItemDto = {
    code: number;
    message: string;
    data: OutputAssetListItemDto;
  };

  type ApiResponseOutputAssetListItemDtoArray = {
    code: number;
    message: string;
    data: OutputAssetListItemDto[];
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

  type ApiResponseOutputChatConversationDto = {
    code: number;
    message: string;
    data: OutputChatConversationDto;
  };

  type ApiResponseOutputChatConversationDtoArray = {
    code: number;
    message: string;
    data: OutputChatConversationDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputChatMessageDto = {
    code: number;
    message: string;
    data: OutputChatMessageDto;
  };

  type ApiResponseOutputChatMessageDtoArray = {
    code: number;
    message: string;
    data: OutputChatMessageDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputCommunityDto = {
    code: number;
    message: string;
    data: OutputCommunityDto;
  };

  type ApiResponseOutputCommunityDtoArray = {
    code: number;
    message: string;
    data: OutputCommunityDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputCommunityListItemDtoArray = {
    code: number;
    message: string;
    data: OutputCommunityListItemDto[];
    meta: PaginationMetaDto;
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

  type ApiResponseOutputCreditAccountDto = {
    code: number;
    message: string;
    data: OutputCreditAccountDto;
  };

  type ApiResponseOutputCreditRecordDtoArray = {
    code: number;
    message: string;
    data: OutputCreditRecordDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputDepositDeductionDto = {
    code: number;
    message: string;
    data: OutputDepositDeductionDto;
  };

  type ApiResponseOutputDepositDeductionDtoArray = {
    code: number;
    message: string;
    data: OutputDepositDeductionDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputDepositDto = {
    code: number;
    message: string;
    data: OutputDepositDto;
  };

  type ApiResponseOutputDepositDtoArray = {
    code: number;
    message: string;
    data: OutputDepositDto[];
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

  type ApiResponseOutputFinanceDtoArray = {
    code: number;
    message: string;
    data: OutputFinanceDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputInviteRankItemDtoArray = {
    code: number;
    message: string;
    data: OutputInviteRankItemDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputLesseeDepositSummaryDto = {
    code: number;
    message: string;
    data: OutputLesseeDepositSummaryDto;
  };

  type ApiResponseOutputLesseeOrderStatisticsDto = {
    code: number;
    message: string;
    data: OutputLesseeOrderStatisticsDto;
  };

  type ApiResponseOutputLesseeStatisticsDto = {
    code: number;
    message: string;
    data: OutputLesseeStatisticsDto;
  };

  type ApiResponseOutputLessorFinanceStatisticsDto = {
    code: number;
    message: string;
    data: OutputLessorFinanceStatisticsDto;
  };

  type ApiResponseOutputLessorOperationPermissionDto = {
    code: number;
    message: string;
    data: OutputLessorOperationPermissionDto;
  };

  type ApiResponseOutputLessorOrderStatisticsDto = {
    code: number;
    message: string;
    data: OutputLessorOrderStatisticsDto;
  };

  type ApiResponseOutputLessorPendingOrderStatisticsDto = {
    code: number;
    message: string;
    data: OutputLessorPendingOrderStatisticsDto;
  };

  type ApiResponseOutputLessorStatisticsDto = {
    code: number;
    message: string;
    data: OutputLessorStatisticsDto;
  };

  type ApiResponseOutputMerchantAccountDto = {
    code: number;
    message: string;
    data: OutputMerchantAccountDto;
  };

  type ApiResponseOutputMerchantInviteRelationDtoArray = {
    code: number;
    message: string;
    data: OutputMerchantInviteRelationDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputMerchantInviteRewardDtoArray = {
    code: number;
    message: string;
    data: OutputMerchantInviteRewardDto[];
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

  type ApiResponseOutputMyAssetListItemDtoArray = {
    code: number;
    message: string;
    data: OutputMyAssetListItemDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputMyInviteCodeDto = {
    code: number;
    message: string;
    data: OutputMyInviteCodeDto;
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

  type ApiResponseOutputPayDepositResultDto = {
    code: number;
    message: string;
    data: OutputPayDepositResultDto;
  };

  type ApiResponseOutputPaymentDto = {
    code: number;
    message: string;
    data: OutputPaymentDto;
  };

  type ApiResponseOutputPaymentDtoArray = {
    code: number;
    message: string;
    data: OutputPaymentDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputPayRentalOrderResultDto = {
    code: number;
    message: string;
    data: OutputPayRentalOrderResultDto;
  };

  type ApiResponseOutputRentalOrderDto = {
    code: number;
    message: string;
    data: OutputRentalOrderDto;
  };

  type ApiResponseOutputRentalOrderDtoArray = {
    code: number;
    message: string;
    data: OutputRentalOrderDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputRentalReviewAdminDtoArray = {
    code: number;
    message: string;
    data: OutputRentalReviewAdminDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputRentalReviewDto = {
    code: number;
    message: string;
    data: OutputRentalReviewDto;
  };

  type ApiResponseOutputRentalReviewDtoArray = {
    code: number;
    message: string;
    data: OutputRentalReviewDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseOutputRentalReviewSummaryDto = {
    code: number;
    message: string;
    data: OutputRentalReviewSummaryDto;
  };

  type ApiResponseOutputReportDto = {
    code: number;
    message: string;
    data: OutputReportDto;
  };

  type ApiResponseOutputReportDtoArray = {
    code: number;
    message: string;
    data: OutputReportDto[];
    meta: PaginationMetaDto;
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

  type ApiResponseOutputWithdrawOrderDto = {
    code: number;
    message: string;
    data: OutputWithdrawOrderDto;
  };

  type ApiResponseOutputWithdrawOrderDtoArray = {
    code: number;
    message: string;
    data: OutputWithdrawOrderDto[];
    meta: PaginationMetaDto;
  };

  type ApiResponseRenewPreviewDto = {
    code: number;
    message: string;
    data: RenewPreviewDto;
  };

  type ApiResponseSimpleOutputAssetInventoryDto = {
    code: number;
    message: string;
    data: SimpleOutputAssetInventoryDto;
  };

  type ApiResponseString = {
    code: number;
    message: string;
    data: string;
  };

  type AppAssetCategoryControllerGetCategoriesV1Params = {
    /** 父分类 ID（不传表示获取根分类） */
    parentId?: string;
    /** 是否包含子分类 */
    includeChildren?: boolean;
    /** 子分类深度（当 includeChildren 为 true 时有效，默认为全部深度） */
    depth?: number;
    /** 是否显示在首页 */
    displayOnHome?: boolean;
  };

  type AppAssetCategoryControllerGetCategoryByCodeV1Params = {
    /** 分类代码 */
    code: string;
  };

  type AppAssetCategoryControllerGetChildCategoriesV1Params = {
    /** 父分类 ID */
    id: string;
    /** 是否包含子分类的子分类 */
    includeChildren?: boolean;
  };

  type AppAssetCommentControllerDeleteV1Params = {
    /** 留言 ID */
    id: string;
  };

  type AppAssetCommentControllerGetByIdV1Params = {
    /** 留言 ID */
    id: string;
  };

  type AppAssetCommentControllerGetCommentCountByAssetIdV1Params = {
    /** 资产 ID */
    assetId: string;
  };

  type AppAssetCommentControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 资产 ID */
    assetId?: string;
    /** 父留言 ID（不传则查询顶级留言，传了则查询该留言的回复） */
    parentId?: string;
    /** 用户 ID（查询某个用户的留言） */
    userId?: string;
    /** 是否只查询顶级留言（不包含回复） */
    topLevelOnly?: boolean;
  };

  type AppAssetCommentControllerUpdateV1Params = {
    /** 留言 ID */
    id: string;
  };

  type AppAssetControllerDeleteAssetV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AppAssetControllerGetAssetDetailV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AppAssetControllerGetAssetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 纬度 */
    latitude?: number;
    /** 经度 */
    longitude?: number;
    /** 关键字搜索（搜索资产名称、描述） */
    keyword?: string;
    /** 分类 ID */
    categoryId?: string;
    /** 分类代码 */
    categoryCode?: string;
    /** 租赁方式 */
    rentalType?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'buy';
    /** 最低价格（单位：分） */
    minPrice?: number;
    /** 最高价格（单位：分） */
    maxPrice?: number;
    /** 省份代码 */
    provinceCode?: string;
    /** 城市代码 */
    cityCode?: string;
    /** 区县代码 */
    districtCode?: string;
    /** 排序字段 */
    sortBy?:
      | 'createdAt'
      | 'publishAt'
      | 'newest'
      | 'price'
      | 'viewCount'
      | 'rentalCount'
      | 'rating'
      | 'recommend'
      | 'nearby';
    /** 排序方向 */
    sortOrder?: 'ASC' | 'DESC';
    /** 出租人 ID */
    lessorId?: string;
  };

  type AppAssetControllerGetMyAssetDetailV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AppAssetControllerGetMyAssetsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 资产状态 */
    status?: 'draft' | 'available' | 'offline';
    /** 审核状态 */
    auditStatus?: 'pending' | 'auditing' | 'approved' | 'rejected';
    /** 关键字搜索 */
    keyword?: string;
    /** 分类 ID */
    categoryId?: string;
  };

  type AppAssetControllerOfflineAssetV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AppAssetControllerPublishAssetV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AppAssetControllerUpdateAssetV1Params = {
    /** 资产 ID */
    id: string;
  };

  type AppAssetInventoryControllerDeleteV1Params = {
    /** 资产实例 ID */
    id: string;
  };

  type AppAssetInventoryControllerForceUnbindV1Params = {
    /** 资产实例 ID */
    id: string;
  };

  type AppAssetInventoryControllerGetByAssetIdV1Params = {
    /** 资产 ID */
    assetId: string;
  };

  type AppAssetInventoryControllerGetByIdV1Params = {
    /** 资产实例 ID */
    id: string;
  };

  type AppAssetInventoryControllerGetByInstanceCodeV1Params = {
    /** 实例编号 */
    inventoryCode: string;
    /** 资产 ID */
    assetId: string;
  };

  type AppAssetInventoryControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 资产 ID */
    assetId: string;
    /** 实例编号 */
    instanceCode?: string;
    /** 实例状态 */
    status?: 'available' | 'rented' | 'maintenance' | 'sold' | 'scraped' | 'damaged' | 'lost';
    /** 关键字搜索（搜索实例编号、实例名称） */
    keyword?: string;
  };

  type AppAssetInventoryControllerUpdateV1Params = {
    /** 资产实例 ID */
    id: string;
  };

  type AppChatControllerGetConversationByIdV1Params = {
    /** 会话 ID */
    id: string;
  };

  type AppChatControllerGetConversationsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
  };

  type AppChatControllerGetMessagesV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 开始日期 (ISO 8601 格式) */
    startDate?: string;
    /** 结束日期 (ISO 8601 格式) */
    endDate?: string;
    /** 会话 ID */
    conversationId?: string;
    /** 对方用户 ID（用于查找会话） */
    otherUserId?: string;
    /** 消息类型 */
    type?: string;
    /** 是否只查询未读消息 */
    unreadOnly?: boolean;
  };

  type AppChatControllerMarkConversationAsReadV1Params = {
    /** 会话 ID */
    id: string;
  };

  type AppChatControllerRecallMessageV1Params = {
    /** 消息 ID */
    id: string;
  };

  type AppChatControllerUpdateConversationV1Params = {
    /** 会话 ID */
    id: string;
  };

  type AppCommunityAssetControllerBindAssetV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AppCommunityAssetControllerGetCommunityAssetsV1Params = {
    /** 社区 ID */
    id: string;
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 资产类型：rental 租赁 / mall 电商 */
    assetType?: 'rental' | 'mall';
    /** 资产分类 code */
    categoryCode?: string;
    /** 排序 */
    sort?: 'createdAt' | 'rentalCount' | 'viewCount';
    /** 排序方向 */
    order?: 'asc' | 'desc';
  };

  type AppCommunityAssetControllerUnbindAssetV1Params = {
    /** 社区 ID */
    id: string;
    /** 资产 ID */
    assetId: string;
  };

  type AppCommunityControllerDeleteV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AppCommunityControllerGetDetailV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AppCommunityControllerGetListV1Params = {
    /** 关键字搜索（社区名称、描述） */
    keyword?: string;
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 社区类型 */
    type?: 'public' | 'private';
    /** 仅已加入 */
    joined?: boolean;
    /** 排序字段 */
    sort?: 'memberCount' | 'assetCount' | 'createdAt';
    /** 排序方向 */
    order?: 'asc' | 'desc';
  };

  type AppCommunityControllerGetMyCreatedV1Params = {
    page: number;
    pageSize: number;
    status: string;
  };

  type AppCommunityControllerGetMyJoinedV1Params = {
    /** 关键字搜索（社区名称、描述） */
    keyword?: string;
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
  };

  type AppCommunityControllerJoinV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AppCommunityControllerLeaveV1Params = {
    /** 社区 ID */
    id: string;
  };

  type AppCommunityControllerResetInviteCodeV1Params = {
    /** 社区 ID */
    id: string;
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

  type AppCreditControllerGetAccountV1Params = {
    /** 角色：lessee 承租方 / lessor 出租方 */
    actorRole?: 'lessee' | 'lessor';
  };

  type AppCreditControllerGetRecordsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 角色维度：lessee 承租方 / lessor 出租方 */
    actorRole?: 'lessee' | 'lessor';
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

  type AppLesseeDepositControllerGetDeductionsV1Params = {
    /** 押金 ID */
    id: string;
  };

  type AppLesseeDepositControllerGetDepositByIdV1Params = {
    /** 押金 ID */
    id: string;
  };

  type AppLesseeDepositControllerGetDepositByOrderIdV1Params = {
    /** 订单 ID */
    orderId: string;
  };

  type AppLesseeDepositControllerQueryDepositsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 订单 ID */
    orderId?: string;
    /** 订单号 */
    orderNo?: string;
    /** 用户 ID */
    userId?: string;
    /** 押金状态 */
    status?:
      | 'pending'
      | 'frozen'
      | 'paid'
      | 'partial_deducted'
      | 'fully_deducted'
      | 'unfrozen'
      | 'returned'
      | 'canceled'
      | 'none'
      | 'failed'
      | 'refunding';
  };

  type AppLessorDepositControllerGetDeductionsV1Params = {
    /** 押金 ID */
    id: string;
  };

  type AppLessorDepositControllerGetDepositByIdV1Params = {
    /** 押金 ID */
    id: string;
  };

  type AppLessorDepositControllerGetDepositByOrderIdV1Params = {
    /** 订单 ID */
    orderId: string;
  };

  type AppLessorDepositControllerQueryDepositsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 订单 ID */
    orderId?: string;
    /** 订单号 */
    orderNo?: string;
    /** 用户 ID */
    userId?: string;
    /** 押金状态 */
    status?:
      | 'pending'
      | 'frozen'
      | 'paid'
      | 'partial_deducted'
      | 'fully_deducted'
      | 'unfrozen'
      | 'returned'
      | 'canceled'
      | 'none'
      | 'failed'
      | 'refunding';
  };

  type AppLessorFinanceControllerFindPageListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 账务方向：收入/支出 */
    direction?: 'income' | 'expense';
    /** 账务状态 */
    status?: 'pending' | 'confirmed' | 'reversed' | 'cancelled';
    /** 业务大类 */
    businessType?: 'ORDER' | 'DEPOSIT' | 'PENALTY' | 'COMPENSATION' | 'WITHDRAW';
    /** 开始日期（按业务发生时间筛选，含当日 00:00:00） */
    startDate?: string;
    /** 结束日期（按业务发生时间筛选，含当日 23:59:59） */
    endDate?: string;
  };

  type AppMerchantInviteControllerGetMyInvitationsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
  };

  type AppMerchantInviteControllerGetMyRewardsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 奖励类型 */
    type?: string;
    /** 奖励状态 */
    status?: string;
  };

  type AppMerchantInviteControllerGetRankV1Params = {
    /** 周期：monthly | quarterly | yearly */
    period?: string;
    /** 年份 */
    year?: number;
    /** 月份（period=monthly 时有效） */
    month?: number;
    /** 返回条数 */
    limit?: number;
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
    type?: 'SYSTEM' | 'USER' | 'ORDER' | 'VERIFICATION' | 'PAYMENT' | 'ASSET' | 'REVIEW';
    /** 消息状态 */
    status?: 'UNREAD' | 'READ' | 'DELETED';
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

  type AppOutputAssetCategoryDto = {
    /** 主键 ID（UUID） */
    id: string;
    /** 分类代码 */
    code: string;
    /** 分类名称 */
    name?: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 排序权重 */
    sortOrder: number;
    /** 分类属性 */
    attributes?: Record<string, any>;
    /** 是否显示在首页 */
    displayOnHome: boolean;
    /** 是否有子分类 */
    hasChildren?: boolean;
  };

  type AppOutputAssetCategoryTreeDto = {
    /** 主键 ID（UUID） */
    id: string;
    /** 分类代码 */
    code: string;
    /** 分类名称 */
    name?: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 排序权重 */
    sortOrder: number;
    /** 分类属性 */
    attributes?: Record<string, any>;
    /** 是否显示在首页 */
    displayOnHome: boolean;
    /** 是否有子分类 */
    hasChildren?: boolean;
    /** 子分类列表 */
    children?: AppOutputAssetCategoryTreeDto[];
  };

  type AppRentalOrderLesseeControllerCancelOrderV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerConfirmDepositDeductionV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerConfirmReceiptV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerDeleteOrderV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerGetOrderByIdV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerPayDepositV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerPayInstallmentV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerPayOrderV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerPayOverdueUseFeeV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerQueryOrdersV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 订单状态/使用状态/逾期状态：created、pending_receipt、received、completed、dispute、in_use、overdue、overdue_use、overdue_fee_paid、wait_return */
    status?:
      | 'created'
      | 'pending_receipt'
      | 'received'
      | 'completed'
      | 'dispute'
      | 'in_use'
      | 'overdue'
      | 'overdue_use'
      | 'overdue_fee_paid'
      | 'wait_return';
    /** 支付状态 */
    paymentStatus?: 'none' | 'pending' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled';
    /** 退款状态 */
    refundStatus?: 'none' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled' | 'partial_refund';
    /** 资产 ID */
    assetId?: string;
    /** 订单号 */
    orderNo?: string;
  };

  type AppRentalOrderLesseeControllerReturnAssetV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLesseeControllerRevokeCancelOrderV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerApproveCancelOrderV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerBindAssetInventoryV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerCancelByLessorOrderV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerCancelDepositDeductionV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerConfirmReturnV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerDeductDepositV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerEndOrderV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerForceCloseOrderV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerGetOperationPermissionV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerGetOrderByIdV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerQueryOrdersV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 订单状态/使用状态/逾期状态：created、pending_receipt、received、completed、dispute、in_use、overdue、overdue_use、overdue_fee_paid、wait_return */
    status?:
      | 'created'
      | 'pending_receipt'
      | 'received'
      | 'completed'
      | 'dispute'
      | 'in_use'
      | 'overdue'
      | 'overdue_use'
      | 'overdue_fee_paid'
      | 'wait_return';
    /** 支付状态 */
    paymentStatus?: 'none' | 'pending' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled';
    /** 退款状态 */
    refundStatus?: 'none' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled' | 'partial_refund';
    /** 资产 ID */
    assetId?: string;
    /** 订单号 */
    orderNo?: string;
  };

  type AppRentalOrderLessorControllerQueryPendingOrdersV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 订单状态（可选，仅限待处理状态） */
    status?:
      | 'cancel_pending'
      | 'dispute'
      | 'overdue'
      | 'overdue_use'
      | 'overdue_fee_paid'
      | 'pending_receipt'
      | 'returned_pending'
      | 'wait_return';
  };

  type AppRentalOrderLessorControllerRebindAssetInventoryV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerRefundDepositV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerRefundPaymentRecordV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerSetOrderDiscountV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerSetOverdueUseDiscountV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalOrderLessorControllerSetPaymentDiscountV1Params = {
    /** 订单 ID */
    id: string;
  };

  type AppRentalReviewControllerGetListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 资产 ID */
    assetId: string;
    /** 状态（公开接口固定为 approved） */
    status?: 'pending' | 'approved' | 'rejected' | 'hidden';
    /** 评分筛选：all-全部 / good-好评(4-5) / medium-中评(3) / bad-差评(1-2) / withImage-有图 */
    scoreRange?: 'all' | 'good' | 'medium' | 'bad' | 'withImage';
  };

  type AppRentalReviewControllerGetSummaryV1Params = {
    /** 资产 ID */
    assetId: string;
  };

  type AppRentalReviewControllerReplyV1Params = {
    /** 评价 ID */
    id: string;
  };

  type AppReportControllerGetMyListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 资产 ID 筛选 */
    assetId?: string;
    /** 举报原因筛选 */
    reason?: string;
    /** 状态筛选 */
    status?: 0 | 1 | 2 | 3;
  };

  type ApproveCancelOrderDto = {
    /** 是否同意取消 */
    approved: boolean;
    /** 拒绝原因（当 approved 为 false 时） */
    reason?: string;
    /** 凭证图片 URL 列表（当拒绝时可选，用于提供拒绝理由的凭证） */
    evidenceUrls?: string[];
  };

  type AppStatisticsControllerGetLessorFinanceStatisticsV1Params = {
    /** 开始日期（按业务发生时间筛选，含当日 00:00:00） */
    startDate?: string;
    /** 结束日期（按业务发生时间筛选，含当日 23:59:59） */
    endDate?: string;
  };

  type AppWithdrawControllerCancelV1Params = {
    id: string;
  };

  type AppWithdrawControllerGetByIdV1Params = {
    id: string;
  };

  type AppWithdrawControllerListV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 提现状态筛选 */
    status?: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'canceled' | 'processing' | 'completed' | 'failed';
    /** 提现方式筛选 */
    withdrawChannel?: 'wechat' | 'alipay' | 'bank';
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

  type AuditAssetDto = {
    /** 审核操作：approve（通过）/ reject（拒绝） */
    action: 'approve' | 'reject';
    /** 审核意见/备注，拒绝时建议填写 */
    auditRemark?: string;
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
    status?: 'UNREAD' | 'READ' | 'DELETED';
  };

  type BindAssetDto = {
    /** 资产 ID */
    assetId: string;
    /** 在社区内的排序权重 */
    sortOrder?: number;
  };

  type BindAssetInventoryDto = {
    /** 资产实例 ID */
    inventoryId: string;
    /** 绑定资产时拍摄的照片，支持多个凭证 */
    evidenceUrls?: string[];
    /** 凭证描述 */
    description?: string;
  };

  type CancelByLessorDto = {
    /** 取消原因，如库存不足、无法接单等 */
    reason?: string;
  };

  type CancelDepositDeductionDto = {
    /** 押金扣款申请 ID */
    deductionId: string;
    /** 取消原因 */
    cancelReason?: string;
  };

  type CancelRentalOrderDto = {
    /** 取消原因 */
    reason?: string;
    /** 取消订单的证据URL列表 */
    evidenceUrls?: string[];
  };

  type ConfirmDepositDeductionDto = {
    /** 押金扣款申请 ID */
    deductionId: string;
    /** 响应类型（同意/拒绝） */
    responseType: 'approved' | 'rejected';
    /** 响应说明（同意或拒绝的说明） */
    description?: string;
    /** 响应凭证（拒绝时必填，同意时可选） */
    evidenceUrls?: string[];
  };

  type ConfirmReceiptDto = {
    /** 我已确认收货（必填，用户需勾选确认） */
    confirmedReceipt: boolean;
    /** 收货凭证图片 URL 列表（选填，若提供则每项需为合法 URL） */
    evidenceUrls?: string[];
    /** 收货说明（选填） */
    description?: string;
  };

  type ConfirmReturnAssetDto = {
    /** 实际归还时间 */
    actualReturnedAt: string;
    /** 是否确认归还 */
    confirmed: boolean;
    /** 归还说明（确认归还时可选） */
    description?: string;
    /** 确认凭证图片 URL 列表（确认归还时可选，最多9张） */
    evidenceUrls?: string[];
  };

  type CreateAssetCategoryDto = {
    /** 分类代码（唯一标识，只允许大写字母、数字和下划线） */
    code: string;
    /** 分类名称 */
    name: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标（URL 或图标标识） */
    icon?: string;
    /** 排序权重（数字越大越靠前） */
    sortOrder?: number;
    /** 父分类 ID */
    parentId?: string;
    /** 分类属性（JSON 对象，存储扩展属性） */
    attributes?: Record<string, any>;
  };

  type CreateAssetCommentDto = {
    /** 资产 ID */
    assetId: string;
    /** 留言内容 */
    content: string;
    /** 父留言 ID（用于回复，不传则为顶级留言） */
    parentId?: string;
    /** 回复的用户 ID（当 parentId 不为空时，表示回复给哪个用户） */
    replyToUserId?: string;
  };

  type CreateAssetDto = {
    /** 是否有效 */
    isActive?: boolean;
    /** 资产名称 */
    name: string;
    /** 可租数量 */
    availableQuantity: number;
    /** 物流方式（JSON 数组） */
    deliveryMethods: string[];
    /** 物流费用 */
    deliveryFee: number;
    /** 资产描述 */
    description?: string;
    /** 其他说明 */
    notes?: string;
    /** 资产图片（JSON 数组） */
    images: string[];
    /** 资产详情图片（JSON 数组） */
    detailImages?: string[];
    /** 资产封面图（主图 URL） */
    coverImage?: string;
    /** 押金（单位：元） */
    deposit: number;
    /** 是否需要实名认证 */
    requireRealName: boolean;
    /** 资产规格（JSON 对象） */
    specifications?: KeyValuePair[];
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
    /** 是否支持信用免押 */
    creditFreeDeposit: boolean;
    /** 资产是否可购买 */
    isBuyable?: boolean;
    /** 是否是商城商品 */
    isMallProduct?: boolean;
    /** 是否自动发货 */
    autoDelivery?: boolean;
    /** 资产分类Id */
    categoryId: string;
    /** 是否发布，默认发布 */
    publish?: boolean;
    /** 自定义标签 */
    tags?: string[];
    /** 联系人 ID */
    contactId: string;
    /** 租赁计划 */
    rentalPlans: CreateAssetRentalPlanDto[];
    /** 社区 ID，传入则创建成功后自动关联该社区 */
    communityId?: string;
  };

  type CreateAssetInventoryDto = {
    /** 资产 ID（外键） */
    assetId: string;
    /** 实例编号（同一资产下的唯一标识） */
    instanceCode: string;
    /** 实例图片 */
    images?: string[];
    /** 实例名称（可选） */
    instanceName?: string;
    /** 实例状态：available（可用）/ rented（已占用）/ maintenance（维护中）/ sold（已出售）/ scraped（已报废）/ damaged（已损坏）/ lost（已丢失） */
    status: 'available' | 'rented' | 'maintenance' | 'sold' | 'scraped' | 'damaged' | 'lost';
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude?: number;
    /** 实例属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 批量创建的数量 */
    quantity?: number;
    /** 是否是批量创建 */
    isBatchCreate?: boolean;
    /** 实例编号前缀，批量创建时使用 */
    codePrefix?: string;
  };

  type CreateAssetRentalPlanDto = {
    /** 方案名称 */
    name: string;
    /** 租赁方式：hourly（小时租）/ daily（日租）/ weekly（周租）/ monthly（月租）/ quarterly（季租）/ yearly（年租）/ buy（购买） */
    rentalType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'buy';
    /** 租赁价格（每个租赁单位的租金） */
    price: number;
    /** 押金 */
    deposit: number;
    /** 租赁期数 */
    rentalPeriod: number;
    /** 最短租期（单位：根据租赁方式确定） */
    minPeriod: number;
    /** 逾期计时费用（单位：元/天） */
    overdueFee: number;
    /** 逾期计时费用单位 */
    overdueFeeUnit: 'day' | 'hour';
    /** 违约金（单位：分） */
    penaltyFee: number;
    /** 是否租满后资产归属客户 */
    transferOwnershipAfterRental: boolean;
    /** 是否支持分期租赁 */
    isInstallment: boolean;
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
  };

  type CreateChatMessageDto = {
    /** 接收者用户 ID */
    receiverId: string;
    /** 消息类型 */
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
    /** 消息内容（文本消息的内容，或其他类型消息的说明） */
    content?: string;
    /** 文件 URL（图片、视频、语音、文件的存储地址） */
    fileUrl?: string;
    /** 文件名称（文件消息的文件名） */
    fileName?: string;
    /** 文件大小（字节） */
    fileSize?: number;
    /** 文件 MIME 类型 */
    mimeType?: string;
    /** 图片/视频宽度（像素） */
    width?: number;
    /** 图片/视频高度（像素） */
    height?: number;
    /** 语音/视频时长（秒） */
    duration?: number;
    /** 扩展信息（JSON 格式） */
    extra?: Record<string, any>;
  };

  type CreateCommunityDto = {
    /** 社区名称 */
    name: string;
    /** 社区描述 */
    description?: string;
    /** 封面图 URL */
    coverImage?: string;
    /** 社区类型 */
    type: 'public' | 'private';
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

  type CreateDepositDeductionDto = {
    /** 扣款金额（元） */
    amount: number;
    /** 扣款原因 */
    reason: string;
    /** 扣款说明（必填） */
    description: string;
    /** 关联证据，必填 */
    evidenceUrls: string[];
  };

  type CreateFavoriteDto = {
    /** 资产 ID */
    assetId: string;
  };

  type CreateRefundDto = {
    /** 支付 ID */
    paymentId: string;
    /** 退款金额 */
    amount: number;
    /** 退款原因 */
    reason?: string;
    /** 备注 */
    remark?: string;
  };

  type CreateRentalOrderDto = {
    /** 是否需要物流 */
    needDelivery: boolean;
    /** 联系人 ID */
    contactId?: string;
    /** 联系人电话 */
    contactPhone: string;
    /** 联系人姓名 */
    contactName: string;
    /** 租赁开始日期 */
    startDate?: string;
    /** 租赁结束日期 */
    endDate?: string;
    /** 租赁时长(小时数、天数、周数、月数、季数、年数) */
    duration: number;
    /** 用户备注 */
    userRemark?: string;
    /** 资产 ID */
    assetId: string;
    /** 租赁方案 ID（关联到资产租赁方案） */
    rentalPlanId: number;
    /** 开始时间（默认当前时间） */
    startAt: string;
    /** 资产实例编号 */
    inventoryCode?: string;
  };

  type CreateRentalReviewDto = {
    /** 租赁订单 ID */
    orderId: string;
    /** 评分 1-5 */
    score: number;
    /** 评论内容 */
    content?: string;
    /** 图片 URL 数组 */
    images?: string[];
  };

  type CreateReportDto = {
    /** 被举报资产 ID */
    assetId: string;
    /** 举报原因 */
    reason:
      | 'fraud'
      | 'illegal'
      | 'spam'
      | 'inappropriate'
      | 'duplicate'
      | 'price_mismatch'
      | 'copyright'
      | 'privacy'
      | 'prohibited'
      | 'safety'
      | 'harassment'
      | 'other';
    /** 举报说明（不少于 10 字） */
    description: string;
    /** 图片 URL 数组（需先通过 OSS 上传获取，最多 9 张） */
    images?: string[];
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

  type CreateWithdrawDto = {
    /** 提现金额（元） */
    amount: number;
    /** 提现方式 */
    withdrawChannel: 'wechat' | 'alipay' | 'bank';
    /** 提现目标账户。微信/支付宝可不填（从用户绑定信息获取）；银行卡必填 */
    targetAccount?: string;
    /** 开户行地址（选择银行卡时必填，如：中国工商银行深圳科技园支行） */
    bankBranchAddress?: string;
    /** 幂等键（客户端生成，防重复提交） */
    idempotencyKey: string;
  };

  type EndOrderDto = {
    /** 凭证 URL 列表（支持多个凭证） */
    evidenceUrls?: string[];
    /** 凭证描述 */
    description?: string;
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

  type ForceCloseCommunityDto = {
    /** 关闭原因 */
    reason?: string;
  };

  type ForceCloseOrderDto = {
    /** 凭证 URL 列表（必须至少一个，用于留痕） */
    evidenceUrls: string[];
    /** 强制关闭原因说明 */
    description?: string;
  };

  type ForceOfflineAssetDto = {
    /** 强制下架原因，将通知出租方 */
    reason?: string;
  };

  type HandleReportDto = {
    /** 处理动作 */
    action: 'approve' | 'reject' | 'mark_malicious';
    /** 处理备注 */
    remark?: string;
  };

  type IdCardOcrDto = {
    /** 图片二进制数据的 base64 编码（不含 data:image/xxx;base64, 前缀也可）或图片 url */
    image?: string;
    /** 身份证正反面类型：face-正面，back-反面 */
    side: 'face' | 'back';
    /** 是否输出身份证质量分信息（翻拍、复印件、完整度、整体质量、篡改分数） */
    quality_info?: boolean;
  };

  type JoinCommunityDto = {
    /** 邀请码（私密社区必填） */
    inviteCode?: string;
  };

  type KeyValuePair = {
    key: string;
    value: string;
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
    userType: 'personal' | 'enterprise';
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: 'unverified' | 'verified' | 'rejected';
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: 'pending' | 'verified' | 'rejected';
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝） */
    faceRecognitionStatus: 'unverified' | 'verified' | 'rejected';
    /** 实名认证时间 */
    verifiedAt?: string;
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 风险等级：low（低）/ medium（中）/ high（高） */
    riskLevel: 'low' | 'medium' | 'high';
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: 'active' | 'frozen' | 'banned';
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

  type OutputAssetAdminDetailDto = {
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
    /** 资产名称 */
    name: string;
    /** 可租数量 */
    availableQuantity: number;
    /** 物流方式（JSON 数组） */
    deliveryMethods: string[];
    /** 物流费用 */
    deliveryFee: number;
    /** 资产描述 */
    description?: string;
    /** 其他说明 */
    notes?: string;
    /** 资产图片（JSON 数组） */
    images: string[];
    /** 资产详情图片（JSON 数组） */
    detailImages?: string[];
    /** 资产封面图（主图 URL） */
    coverImage?: string;
    /** 资产状态：draft（草稿）/ available（可出租）/ offline（下架） */
    status: 'draft' | 'available' | 'offline';
    /** 联系人 */
    contactName: string;
    /** 联系人手机号 */
    contactPhone: string;
    /** 联系人微信号 */
    contactWeChat?: string;
    /** 押金（单位：元） */
    deposit: number;
    /** 是否需要实名认证 */
    requireRealName: boolean;
    /** 资产规格（JSON 对象） */
    specifications?: KeyValuePair[];
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 自定义标签（JSON 数组） */
    customTags?: string[];
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
    /** 评分（0-5，保留2位小数） */
    rating: number;
    /** 是否支持信用免押 */
    creditFreeDeposit: boolean;
    /** 是否是后付费 */
    isPostPayment: boolean;
    /** 资产是否需要归还 */
    needReturn: boolean;
    /** 距离 */
    distance: number;
    /** 资产是否可购买 */
    isBuyable?: boolean;
    /** 是否是商城商品 */
    isMallProduct?: boolean;
    /** 是否自动发货 */
    autoDelivery?: boolean;
    /** 是否需要电子签名 */
    requireElectronicSignature?: boolean;
    /** 联系人 ID */
    contactId: string;
    /** 出租方 ID（资产所有者） */
    ownerId: string;
    /** 资产分类代码 */
    categoryCode: string;
    /** 资产分类名称 */
    categoryName: string;
    /** 资产分类Id */
    categoryId: string;
    /** 审核状态：pending（待审核）/ approved（审核通过）/ rejected（审核拒绝） */
    auditStatus: 'pending' | 'auditing' | 'approved' | 'rejected';
    /** 审核人 ID（后台管理人员） */
    auditById: string;
    /** 审核时间 */
    auditAt?: string;
    /** 上架时间 */
    publishAt: string;
    /** 审核意见/备注 */
    auditRemark?: string;
    /** 浏览次数 */
    viewCount: number;
    /** 收藏次数 */
    favoriteCount: number;
    /** 租赁次数 */
    rentalCount: number;
    /** 评论数量 */
    reviewCount: number;
    /** 1 星评价数量 */
    score1Count: number;
    /** 2 星评价数量 */
    score2Count: number;
    /** 3 星评价数量 */
    score3Count: number;
    /** 4 星评价数量 */
    score4Count: number;
    /** 5 星评价数量 */
    score5Count: number;
    /** 分类列表 */
    category: OutputAssetCategoryBriefDto[];
    /** 标签列表 */
    tags: OutputAssetTagBriefDto[];
    /** 租赁方案列表 */
    rentalPlans: OutputAssetRentalPlanDto[];
    /** 出租方信息 */
    owner: OutputOwnerBriefDto;
    /** 联系人信息 */
    contact: OutputContactDto;
    /** 当前用户是否已收藏该资产 */
    isFavorite?: boolean;
  };

  type OutputAssetAdminListItemDto = {
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
    /** 资产名称 */
    name: string;
    /** 可租数量 */
    availableQuantity: number;
    /** 物流方式（JSON 数组） */
    deliveryMethods: string[];
    /** 物流费用 */
    deliveryFee: number;
    /** 资产描述 */
    description?: string;
    /** 其他说明 */
    notes?: string;
    /** 资产图片（JSON 数组） */
    images: string[];
    /** 资产详情图片（JSON 数组） */
    detailImages?: string[];
    /** 资产封面图（主图 URL） */
    coverImage?: string;
    /** 资产状态：draft（草稿）/ available（可出租）/ offline（下架） */
    status: 'draft' | 'available' | 'offline';
    /** 联系人 */
    contactName: string;
    /** 联系人手机号 */
    contactPhone: string;
    /** 联系人微信号 */
    contactWeChat?: string;
    /** 押金（单位：元） */
    deposit: number;
    /** 是否需要实名认证 */
    requireRealName: boolean;
    /** 资产规格（JSON 对象） */
    specifications?: KeyValuePair[];
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 自定义标签（JSON 数组） */
    customTags?: string[];
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
    /** 评分（0-5，保留2位小数） */
    rating: number;
    /** 是否支持信用免押 */
    creditFreeDeposit: boolean;
    /** 是否是后付费 */
    isPostPayment: boolean;
    /** 资产是否需要归还 */
    needReturn: boolean;
    /** 距离 */
    distance: number;
    /** 资产是否可购买 */
    isBuyable?: boolean;
    /** 是否是商城商品 */
    isMallProduct?: boolean;
    /** 是否自动发货 */
    autoDelivery?: boolean;
    /** 是否需要电子签名 */
    requireElectronicSignature?: boolean;
    /** 联系人 ID */
    contactId: string;
    /** 出租方 ID（资产所有者） */
    ownerId: string;
    /** 资产分类代码 */
    categoryCode: string;
    /** 资产分类名称 */
    categoryName: string;
    /** 资产分类Id */
    categoryId: string;
    /** 审核状态：pending（待审核）/ approved（审核通过）/ rejected（审核拒绝） */
    auditStatus: 'pending' | 'auditing' | 'approved' | 'rejected';
    /** 审核人 ID（后台管理人员） */
    auditById: string;
    /** 审核时间 */
    auditAt?: string;
    /** 上架时间 */
    publishAt: string;
    /** 审核意见/备注 */
    auditRemark?: string;
    /** 浏览次数 */
    viewCount: number;
    /** 收藏次数 */
    favoriteCount: number;
    /** 租赁次数 */
    rentalCount: number;
    /** 评论数量 */
    reviewCount: number;
    /** 1 星评价数量 */
    score1Count: number;
    /** 2 星评价数量 */
    score2Count: number;
    /** 3 星评价数量 */
    score3Count: number;
    /** 4 星评价数量 */
    score4Count: number;
    /** 5 星评价数量 */
    score5Count: number;
    /** 分类列表 */
    category: OutputAssetCategoryBriefDto[];
    /** 标签列表 */
    tags: OutputAssetTagBriefDto[];
    /** 租赁方案列表 */
    rentalPlans: OutputAssetRentalPlanDto[];
    /** 出租方信息 */
    owner: OutputOwnerBriefDto;
    /** 联系人信息 */
    contact: OutputContactDto;
    /** 当前用户是否已收藏该资产 */
    isFavorite?: boolean;
  };

  type OutputAssetBriefDto = {
    /** 资产 ID */
    id: string;
    /** 资产名称 */
    name: string;
    /** 资产封面图 */
    coverImage?: string;
  };

  type OutputAssetCategoryBriefDto = {
    /** 分类 ID */
    id: string;
    /** 分类代码 */
    code: string;
    /** 分类名称 */
    name: string;
    /** 分类图标 */
    icon?: string;
  };

  type OutputAssetCategoryDetailDto = {
    /** 分类 ID */
    id: string;
    /** 分类代码 */
    code: string;
    /** 分类名称 */
    name: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 排序权重 */
    sortOrder: number;
    /** 分类属性 */
    attributes?: Record<string, any>;
    /** 是否有效 */
    isActive: boolean;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 父分类信息 */
    parent?: OutputAssetCategoryDto;
    /** 子分类列表 */
    children?: OutputAssetCategoryDto[];
    /** 创建者 */
    createdBy?: string;
    /** 更新者 */
    updatedBy?: string;
    /** 备注 */
    remark?: string;
  };

  type OutputAssetCategoryDto = {
    /** 分类 ID */
    id: string;
    /** 分类代码 */
    code: string;
    /** 分类名称 */
    name: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 排序权重 */
    sortOrder: number;
    /** 分类属性 */
    attributes?: Record<string, any>;
    /** 是否有效 */
    isActive: boolean;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
  };

  type OutputAssetCategoryTreeDto = {
    /** 分类 ID */
    id: string;
    /** 分类代码 */
    code: string;
    /** 分类名称 */
    name: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标 */
    icon?: string;
    /** 排序权重 */
    sortOrder: number;
    /** 分类属性 */
    attributes?: Record<string, any>;
    /** 是否有效 */
    isActive: boolean;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 子分类列表 */
    children?: OutputAssetCategoryTreeDto[];
  };

  type OutputAssetCommentDto = {
    /** 留言 ID */
    id: string;
    /** 资产 ID */
    assetId: string;
    /** 留言用户 ID */
    userId: string;
    /** 留言内容 */
    content: string;
    /** 父留言 ID */
    parentId?: Record<string, any>;
    /** 回复的用户 ID */
    replyToUserId?: Record<string, any>;
    /** 点赞数 */
    likeCount: number;
    /** 创建时间 */
    createdAt: string;
    /** 更新时间 */
    updatedAt: string;
    /** 留言用户信息 */
    user?: OutputUserDto;
    /** 被回复的用户信息 */
    replyToUser?: OutputUserDto;
    /** 回复列表 */
    replies?: OutputAssetCommentDto[];
  };

  type OutputAssetCreationStatsDto = {
    /** 今天已创建的资产数量 */
    todayCount: number;
    /** 总资产数量 */
    totalCount: number;
    /** 每天最多可创建的资产数量 */
    maxDailyCount: number;
    /** 总资产数量限制（0 表示不限制） */
    maxTotalCount: number;
    /** 今天是否还可以创建资产 */
    canCreateToday: boolean;
    /** 是否还可以创建资产（总数量限制） */
    canCreateTotal: boolean;
    /** 是否可以创建资产（综合判断） */
    canCreate: boolean;
    /** 今天剩余可创建数量 */
    remainingTodayCount: number;
  };

  type OutputAssetDetailDto = {
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
    /** 资产名称 */
    name: string;
    /** 可租数量 */
    availableQuantity: number;
    /** 物流方式（JSON 数组） */
    deliveryMethods: string[];
    /** 物流费用 */
    deliveryFee: number;
    /** 资产描述 */
    description?: string;
    /** 其他说明 */
    notes?: string;
    /** 资产图片（JSON 数组） */
    images: string[];
    /** 资产详情图片（JSON 数组） */
    detailImages?: string[];
    /** 资产封面图（主图 URL） */
    coverImage?: string;
    /** 资产状态：draft（草稿）/ available（可出租）/ offline（下架） */
    status: 'draft' | 'available' | 'offline';
    /** 联系人 */
    contactName: string;
    /** 联系人手机号 */
    contactPhone: string;
    /** 联系人微信号 */
    contactWeChat?: string;
    /** 押金（单位：元） */
    deposit: number;
    /** 是否需要实名认证 */
    requireRealName: boolean;
    /** 资产规格（JSON 对象） */
    specifications?: KeyValuePair[];
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 自定义标签（JSON 数组） */
    customTags?: string[];
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
    /** 评分（0-5，保留2位小数） */
    rating: number;
    /** 是否支持信用免押 */
    creditFreeDeposit: boolean;
    /** 是否是后付费 */
    isPostPayment: boolean;
    /** 资产是否需要归还 */
    needReturn: boolean;
    /** 距离 */
    distance: number;
    /** 资产是否可购买 */
    isBuyable?: boolean;
    /** 是否是商城商品 */
    isMallProduct?: boolean;
    /** 是否自动发货 */
    autoDelivery?: boolean;
    /** 是否需要电子签名 */
    requireElectronicSignature?: boolean;
    /** 联系人 ID */
    contactId: string;
    /** 出租方 ID（资产所有者） */
    ownerId: string;
    /** 资产分类代码 */
    categoryCode: string;
    /** 资产分类名称 */
    categoryName: string;
    /** 资产分类Id */
    categoryId: string;
    /** 审核状态：pending（待审核）/ approved（审核通过）/ rejected（审核拒绝） */
    auditStatus: 'pending' | 'auditing' | 'approved' | 'rejected';
    /** 审核人 ID（后台管理人员） */
    auditById: string;
    /** 审核时间 */
    auditAt?: string;
    /** 上架时间 */
    publishAt: string;
    /** 审核意见/备注 */
    auditRemark?: string;
    /** 浏览次数 */
    viewCount: number;
    /** 收藏次数 */
    favoriteCount: number;
    /** 租赁次数 */
    rentalCount: number;
    /** 评论数量 */
    reviewCount: number;
    /** 1 星评价数量 */
    score1Count: number;
    /** 2 星评价数量 */
    score2Count: number;
    /** 3 星评价数量 */
    score3Count: number;
    /** 4 星评价数量 */
    score4Count: number;
    /** 5 星评价数量 */
    score5Count: number;
    /** 分类列表 */
    category: OutputAssetCategoryBriefDto[];
    /** 标签列表 */
    tags: OutputAssetTagBriefDto[];
    /** 租赁方案列表 */
    rentalPlans: OutputAssetRentalPlanDto[];
    /** 出租方信息 */
    owner: OutputOwnerBriefDto;
    /** 联系人信息 */
    contact: OutputContactDto;
    /** 当前用户是否已收藏该资产 */
    isFavorite?: boolean;
  };

  type OutputAssetInventoryDto = {
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
    /** 资产 ID（外键） */
    assetId: string;
    /** 实例编号（同一资产下的唯一标识） */
    instanceCode: string;
    /** 实例图片 */
    images?: string[];
    /** 实例名称（可选） */
    instanceName?: string;
    /** 实例状态：available（可用）/ rented（已占用）/ maintenance（维护中）/ sold（已出售）/ scraped（已报废）/ damaged（已损坏）/ lost（已丢失） */
    status: 'available' | 'rented' | 'maintenance' | 'sold' | 'scraped' | 'damaged' | 'lost';
    /** 出租人 ID（冗余自资产，便于按出租人查询） */
    lessorId?: string;
    /** 当前承租人 ID（出租时写入，归还后清空） */
    lesseeId?: string;
    /** 当前租赁订单 ID（出租时写入，归还后清空） */
    orderId?: string;
    /** 当前租赁订单号（冗余） */
    orderNo?: string;
    /** 绑定时间（绑定到当前订单的时间） */
    boundAt?: string;
    /** 解绑时间（从当前订单解绑的时间） */
    unboundAt?: string;
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude?: number;
    /** 实例属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 换绑次数 */
    rebindCount: number;
    /** 租赁次数 */
    rentalCount: number;
    /** 租赁总时长（秒） */
    totalRentalDuration: number;
    /** 资产信息 */
    asset?: OutputAssetBriefDto;
    /** 出租人信息 */
    lessor?: OutputUserBriefDto;
    /** 承租人信息 */
    lessee?: OutputUserForLessorDto;
    /** 空闲时长（秒） */
    idleDuration: number;
    /** 关联订单 */
    order?: OutputRentalOrderDto;
  };

  type OutputAssetInventoryDtoWithRentalOrder = {
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
    /** 资产 ID（外键） */
    assetId: string;
    /** 实例编号（同一资产下的唯一标识） */
    instanceCode: string;
    /** 实例图片 */
    images?: string[];
    /** 实例名称（可选） */
    instanceName?: string;
    /** 实例状态：available（可用）/ rented（已占用）/ maintenance（维护中）/ sold（已出售）/ scraped（已报废）/ damaged（已损坏）/ lost（已丢失） */
    status: 'available' | 'rented' | 'maintenance' | 'sold' | 'scraped' | 'damaged' | 'lost';
    /** 出租人 ID（冗余自资产，便于按出租人查询） */
    lessorId?: string;
    /** 当前承租人 ID（出租时写入，归还后清空） */
    lesseeId?: string;
    /** 当前租赁订单 ID（出租时写入，归还后清空） */
    orderId?: string;
    /** 当前租赁订单号（冗余） */
    orderNo?: string;
    /** 绑定时间（绑定到当前订单的时间） */
    boundAt?: string;
    /** 解绑时间（从当前订单解绑的时间） */
    unboundAt?: string;
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude?: number;
    /** 实例属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 换绑次数 */
    rebindCount: number;
    /** 租赁次数 */
    rentalCount: number;
    /** 租赁总时长（秒） */
    totalRentalDuration: number;
    /** 资产信息 */
    asset?: OutputAssetBriefDto;
    /** 出租人信息 */
    lessor?: OutputUserBriefDto;
    /** 承租人信息 */
    lessee?: OutputUserForLessorDto;
    /** 空闲时长（秒） */
    idleDuration: number;
  };

  type OutputAssetInventorySnapshotDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 资产 ID（外键） */
    assetId: string;
    /** 实例编号（同一资产下的唯一标识） */
    instanceCode: string;
    /** 实例图片 */
    images?: string[];
    /** 实例名称（可选） */
    instanceName?: string;
    /** 实例状态：available（可用）/ rented（已占用）/ maintenance（维护中）/ sold（已出售）/ scraped（已报废）/ damaged（已损坏）/ lost（已丢失） */
    status: 'available' | 'rented' | 'maintenance' | 'sold' | 'scraped' | 'damaged' | 'lost';
    /** 出租人 ID（冗余自资产，便于按出租人查询） */
    lessorId?: string;
    /** 当前承租人 ID（出租时写入，归还后清空） */
    lesseeId?: string;
    /** 当前租赁订单 ID（出租时写入，归还后清空） */
    orderId?: string;
    /** 当前租赁订单号（冗余） */
    orderNo?: string;
    /** 绑定时间（绑定到当前订单的时间） */
    boundAt?: string;
    /** 解绑时间（从当前订单解绑的时间） */
    unboundAt?: string;
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude?: number;
    /** 实例属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 换绑次数 */
    rebindCount: number;
    /** 租赁次数 */
    rentalCount: number;
    /** 租赁总时长（秒） */
    totalRentalDuration: number;
    /** 空闲时长（秒） */
    idleDuration: number;
  };

  type OutputAssetListItemDto = {
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
    /** 资产名称 */
    name: string;
    /** 可租数量 */
    availableQuantity: number;
    /** 物流方式（JSON 数组） */
    deliveryMethods: string[];
    /** 物流费用 */
    deliveryFee: number;
    /** 资产描述 */
    description?: string;
    /** 其他说明 */
    notes?: string;
    /** 资产图片（JSON 数组） */
    images: string[];
    /** 资产详情图片（JSON 数组） */
    detailImages?: string[];
    /** 资产封面图（主图 URL） */
    coverImage?: string;
    /** 资产状态：draft（草稿）/ available（可出租）/ offline（下架） */
    status: 'draft' | 'available' | 'offline';
    /** 联系人 */
    contactName: string;
    /** 联系人手机号 */
    contactPhone: string;
    /** 联系人微信号 */
    contactWeChat?: string;
    /** 押金（单位：元） */
    deposit: number;
    /** 是否需要实名认证 */
    requireRealName: boolean;
    /** 资产规格（JSON 对象） */
    specifications?: KeyValuePair[];
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 自定义标签（JSON 数组） */
    customTags?: string[];
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
    /** 评分（0-5，保留2位小数） */
    rating: number;
    /** 是否支持信用免押 */
    creditFreeDeposit: boolean;
    /** 是否是后付费 */
    isPostPayment: boolean;
    /** 资产是否需要归还 */
    needReturn: boolean;
    /** 距离 */
    distance: number;
    /** 资产是否可购买 */
    isBuyable?: boolean;
    /** 是否是商城商品 */
    isMallProduct?: boolean;
    /** 是否自动发货 */
    autoDelivery?: boolean;
    /** 是否需要电子签名 */
    requireElectronicSignature?: boolean;
    /** 联系人 ID */
    contactId: string;
    /** 出租方 ID（资产所有者） */
    ownerId: string;
    /** 资产分类代码 */
    categoryCode: string;
    /** 资产分类名称 */
    categoryName: string;
    /** 资产分类Id */
    categoryId: string;
    /** 审核状态：pending（待审核）/ approved（审核通过）/ rejected（审核拒绝） */
    auditStatus: 'pending' | 'auditing' | 'approved' | 'rejected';
    /** 审核人 ID（后台管理人员） */
    auditById: string;
    /** 审核时间 */
    auditAt?: string;
    /** 上架时间 */
    publishAt: string;
    /** 审核意见/备注 */
    auditRemark?: string;
    /** 浏览次数 */
    viewCount: number;
    /** 收藏次数 */
    favoriteCount: number;
    /** 租赁次数 */
    rentalCount: number;
    /** 评论数量 */
    reviewCount: number;
    /** 1 星评价数量 */
    score1Count: number;
    /** 2 星评价数量 */
    score2Count: number;
    /** 3 星评价数量 */
    score3Count: number;
    /** 4 星评价数量 */
    score4Count: number;
    /** 5 星评价数量 */
    score5Count: number;
    /** 分类列表 */
    category: OutputAssetCategoryBriefDto[];
    /** 标签列表 */
    tags: OutputAssetTagBriefDto[];
    /** 租赁方案列表 */
    rentalPlans: OutputAssetRentalPlanDto[];
    /** 出租方信息 */
    owner: OutputOwnerBriefDto;
    /** 联系人信息 */
    contact: OutputContactDto;
    /** 当前用户是否已收藏该资产 */
    isFavorite?: boolean;
  };

  type OutputAssetRentalPlanDto = {
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
    /** 资产 ID */
    assetId: string;
    /** 出租方 ID（资产所有者） */
    ownerId: string;
    /** 方案名称 */
    name: string;
    /** 方案描述 */
    description: string;
    /** 租赁方式：hourly（小时租）/ daily（日租）/ weekly（周租）/ monthly（月租）/ quarterly（季租）/ yearly（年租）/ buy（购买） */
    rentalType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'buy';
    /** 租赁价格（每个租赁单位的租金） */
    price: number;
    /** 押金 */
    deposit: number;
    /** 租赁期数 */
    rentalPeriod: number;
    /** 最短租期（单位：根据租赁方式确定） */
    minPeriod: number;
    /** 最长租期（单位：根据租赁方式确定，0 表示不限制） */
    maxPeriod: number;
    /** 逾期计时费用（单位：元/天） */
    overdueFee: number;
    /** 逾期计时费用单位 */
    overdueFeeUnit: 'day' | 'hour';
    /** 违约金（单位：分） */
    penaltyFee: number;
    /** 送货方式 */
    deliveryMethod:
      | 'same-city-delivery'
      | 'self-pickup'
      | 'express-delivery'
      | 'mail-delivery'
      | 'cash-on-delivery'
      | 'other';
    /** 配送费 */
    deliveryFee: number;
    /** 是否租满后资产归属客户 */
    transferOwnershipAfterRental: boolean;
    /** 租满后资产归属的期数（当 transferOwnershipAfterRental = true 时有效） */
    ownershipTransferPeriod: number;
    /** 是否支持分期租赁 */
    isInstallment: boolean;
    /** 一次性支付全部分期租金 */
    payAllInstallmentInOneTime: boolean;
    /** 可租时间窗口（JSON 对象） */
    availabilityWindow: Record<string, any>;
    /** 使用限制（JSON 对象） */
    usageRestrictions: Record<string, any>;
    /** 提前归还规则（JSON 对象） */
    earlyReturnPolicy: Record<string, any>;
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 平台服务费率（百分比，0-100） */
    platformServiceRate: number;
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
    /** 续租规则 */
    renewalPolicy: RenewalPolicyDto;
    /** 逾期费用单位标签 */
    overdueFeeUnitLabel: string;
  };

  type OutputAssetTagBriefDto = {
    /** 标签 ID */
    id: string;
    /** 标签名称 */
    name: string;
    /** 标签颜色 */
    color?: string;
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

  type OutputChatConversationDto = {
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
    /** 用户1 ID */
    userId1: string;
    /** 用户2 ID */
    userId2: string;
    /** 会话状态 */
    status: 'active' | 'deleted' | 'blocked';
    /** 最后一条消息 ID */
    lastMessageId?: string;
    /** 最后一条消息内容（预览） */
    lastMessageContent?: string;
    /** 最后一条消息时间 */
    lastMessageAt?: string;
    /** 用户1未读消息数 */
    unreadCount1: number;
    /** 用户2未读消息数 */
    unreadCount2: number;
    /** 用户1是否屏蔽了会话 */
    blockedByUser1: boolean;
    /** 用户2是否屏蔽了会话 */
    blockedByUser2: boolean;
    /** 用户1最后阅读时间 */
    lastReadAt1?: string;
    /** 用户2最后阅读时间 */
    lastReadAt2?: string;
    /** 对方用户信息 */
    otherUser?: OutputUserDto;
    /** 当前用户的未读消息数 */
    unreadCount?: number;
    /** 当前用户是否屏蔽了会话 */
    isBlocked?: boolean;
  };

  type OutputChatMessageDto = {
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
    /** 会话 ID */
    conversationId: string;
    /** 发送者 ID */
    senderId: string;
    /** 接收者 ID */
    receiverId: string;
    /** 消息类型 */
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
    /** 消息内容 */
    content?: string;
    /** 文件 URL */
    fileUrl?: string;
    /** 文件名称 */
    fileName?: string;
    /** 文件大小（字节） */
    fileSize?: number;
    /** 文件 MIME 类型 */
    mimeType?: string;
    /** 图片/视频宽度（像素） */
    width?: number;
    /** 图片/视频高度（像素） */
    height?: number;
    /** 语音/视频时长（秒） */
    duration?: number;
    /** 消息状态 */
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'recalled';
    /** 是否已读 */
    isRead: boolean;
    /** 已读时间 */
    readAt?: string;
    /** 扩展信息（JSON 格式） */
    extra?: Record<string, any>;
    /** 发送者信息 */
    sender?: OutputUserDto;
    /** 接收者信息 */
    receiver?: OutputUserDto;
  };

  type OutputCommunityDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 社区名称 */
    name: string;
    /** 社区描述 */
    description?: string;
    /** 封面图 URL */
    coverImage?: string;
    /** 社区类型 */
    type: 'public' | 'private';
    /** 社区状态 */
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    /** 邀请码（私密社区必填） */
    inviteCode?: string;
    /** 创建者用户 ID */
    creatorId: string;
    /** 审核人 ID */
    auditById?: string;
    /** 审核时间 */
    auditAt?: string;
    /** 审核意见（拒绝时填写） */
    auditRemark?: string;
    /** 成员数量（冗余） */
    memberCount: number;
    /** 绑定资产数量（冗余） */
    assetCount: number;
    /** 排序权重（越大越靠前） */
    sortOrder: number;
    /** 当前用户是否已加入 */
    joined?: boolean;
    /** 当前用户角色 */
    role?: 'creator' | 'admin' | 'member';
    /** 社区状态 */
    statusText: 'pending' | 'approved' | 'rejected' | 'closed';
  };

  type OutputCommunityListItemDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 社区名称 */
    name: string;
    /** 社区描述 */
    description?: string;
    /** 封面图 URL */
    coverImage?: string;
    /** 社区类型 */
    type: 'public' | 'private';
    /** 社区状态 */
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    /** 邀请码（私密社区必填） */
    inviteCode?: string;
    /** 创建者用户 ID */
    creatorId: string;
    /** 审核人 ID */
    auditById?: string;
    /** 审核时间 */
    auditAt?: string;
    /** 审核意见（拒绝时填写） */
    auditRemark?: string;
    /** 排序权重（越大越靠前） */
    sortOrder: number;
    /** 当前用户是否已加入 */
    joined?: boolean;
    /** 当前用户角色 */
    role?: 'creator' | 'admin' | 'member';
    /** 社区状态 */
    statusText: 'pending' | 'approved' | 'rejected' | 'closed';
    /** 成员数量（私密社区不返回） */
    memberCount?: number;
    /** 资产数量（私密社区不返回） */
    assetCount?: number;
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

  type OutputCreditAccountDto = {
    /** 是否有效 */
    isActive?: boolean;
    /** 备注 */
    remark?: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 用户 ID */
    userId: string;
    /** 角色：lessor 出租方 / lessee 承租方 */
    actorRole: 'lessee' | 'lessor';
    /** 综合信用分（300-950 有效区间） */
    creditScore: number;
    /** 行为分 */
    behaviorScore: number;
    /** 风险分 */
    riskScore: number;
    /** 资产稳定分 */
    stabilityScore: number;
    /** 信用等级：AAA 900-950, AA 850-899, A 800-849, B 700-799, C 600-699, D 500-599, E <500 */
    creditLevel: 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D' | 'E';
    /** 信用状态：normal 正常 / frozen 冻结 */
    creditStatus: 'normal' | 'frozen';
    /** 模型版本 */
    modelVersion: string;
    /** 最后计算时间 */
    lastCalculatedAt?: string;
    /** 是否免押（仅承租方有效） */
    depositFree?: boolean;
    /** 押金比例 0-1（仅承租方有效） */
    depositRatio?: number;
    /** 是否支持分期（仅承租方有效） */
    installmentAllowed?: boolean;
  };

  type OutputCreditRecordDto = {
    /** 事件 ID */
    id: string;
    /** 事件类型 */
    eventType:
      | 'order_completed'
      | 'dispute_won'
      | 'order_overdue'
      | 'order_default'
      | 'dispute_opened'
      | 'dispute_lost'
      | 'deposit_deducted'
      | 'fraud_confirmed'
      | 'manual_reward'
      | 'manual_penalty';
    /** 事件类型标签 */
    eventTypeLabel: string;
    /** 角色 */
    actorRole: 'lessee' | 'lessor';
    /** 影响分（正为加分，负为扣分） */
    impactScore: number;
    /** 关联订单 ID */
    relatedOrderId: Record<string, any>;
    /** 创建时间 */
    createdAt: string;
  };

  type OutputDepositDeductionDto = {
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
    /** 扣款单号（唯一，业务标识） */
    deductionNo: string;
    /** 押金 ID */
    depositId: string;
    /** 押金单号 */
    depositNo: string;
    /** 订单 ID */
    orderId: string;
    /** 订单号 */
    orderNo: string;
    /** 扣款金额（元） */
    amount: number;
    /** 扣款原因 */
    reason: string;
    /** 扣款说明 */
    description?: string;
    /** 扣款状态：pending_user_confirm（待用户确认）/ pending_audit（待审核）/ user_approved（用户同意）/ user_rejected（用户拒绝）/ platform_approved（平台已审核）/ platform_rejected（平台已拒绝）/ executed（已执行）/ cancelled（已取消） */
    status:
      | 'pending_user_confirm'
      | 'pending_audit'
      | 'platform_approved'
      | 'platform_rejected'
      | 'executed'
      | 'cancelled';
    /** 申请提交时间（出租方提交扣款申请的时间） */
    appliedAt: string;
    /** 扣款时间（实际执行扣款的时间） */
    deductedAt?: string;
    /** 申请超时时间（申请提交后72小时，用户未处理，则自动标记为平台待审核） */
    timeoutAt?: string;
    /** 操作人 ID */
    operatorId?: string;
    /** 操作人名称 */
    operatorName?: string;
    /** 承租方 ID */
    lesseeId: string;
    /** 申请提交人 ID（出租方） */
    lessorId: string;
    /** 申请提交人名称（出租方） */
    lessorName?: string;
    /** 取消原因（出租方取消扣款申请的原因） */
    cancelReason?: string;
    /** 取消时间 */
    cancelAt?: string;
    /** 承租方响应时间 */
    userRespondedAt?: string;
    /** 承租方响应类型（approved/rejected） */
    userResponseType?: 'approved' | 'rejected';
    /** 承租方响应说明（同意或拒绝的说明） */
    userResponseDescription?: string;
    /** 平台审核时间 */
    platformAuditedAt?: string;
    /** 平台审核人 ID */
    platformAuditorId?: string;
    /** 平台审核人名称 */
    platformAuditorName?: string;
    /** 平台审核说明 */
    platformAuditDescription?: string;
    /** 状态标签 */
    statusLabel: string;
    /** 关联证据 */
    evidence: OutputDepositEvidenceDto;
    /** 承租方响应凭证 */
    userResponseEvidence: OutputDepositEvidenceDto;
    /** 出租方 */
    lessor: OutputUserDto;
    /** 承租方 */
    lessee: OutputUserDto;
  };

  type OutputDepositDto = {
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
    /** 押金单号（唯一，业务标识） */
    depositNo: string;
    /** 订单 ID */
    orderId: string;
    /** 订单号 */
    orderNo: string;
    /** 用户 ID（承租方） */
    userId: string;
    /** 出租方 ID */
    lessorId: string;
    /** 押金金额（元） */
    amount: number;
    /** 已扣除金额（元） */
    deductedAmount: number;
    /** 剩余金额（元） */
    remainingAmount: number;
    /** 免押类型：none（无免押，现金支付押金）/ alipay（支付宝免押）/ wechat（微信免押） */
    freeType: 'none' | 'alipay' | 'wechat';
    /** 免押授权号（第三方免押授权号） */
    freeAuthNo?: string;
    /** 免押授权数据（JSON） */
    freeAuthData?: Record<string, any>;
    /** 支付方式（alipay/wechat） */
    paymentProvider?: 'alipay' | 'wechat';
    /** 第三方支付单号（如果使用支付方式） */
    thirdPartyPaymentNo?: string;
    /** 退款单号 */
    refundNo?: string;
    /** 三方退款单号（如果使用退款方式） */
    thirdPartyRefundNo?: string;
    /** 支付回调数据（JSON） */
    paymentCallbackData?: Record<string, any>;
    /** 退款回调数据（JSON） */
    refundCallbackData?: Record<string, any>;
    /** 支付失败原因 */
    paymentFailureReason?: string;
    /** pending（待支付）/ frozen（已冻结）/ partial_deducted（部分扣除）/ fully_deducted（已全部扣除）/ unfrozen（已解冻）/ returned（已退还）/ canceled（已取消）/ none（无押金）/ failed（冻结失败或支付失败）/ refunding（退款/解冻中） */
    status:
      | 'pending'
      | 'frozen'
      | 'paid'
      | 'partial_deducted'
      | 'fully_deducted'
      | 'unfrozen'
      | 'returned'
      | 'canceled'
      | 'none'
      | 'failed'
      | 'refunding';
    /** 冻结时间（支付完成时间或免押授权时间） */
    frozenAt?: string;
    /** 解冻时间，解冻或退还押金成功的时间 */
    unfrozenAt?: string;
    /** 扣款记录 */
    deductions: OutputDepositDeductionDto[];
  };

  type OutputDepositEvidenceDto = {
    /** 凭证 URL 地址列表 */
    urls?: string[];
    /** 说明 */
    description: string;
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
    userType: 'personal' | 'enterprise';
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: 'pending' | 'verified' | 'rejected';
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: 'active' | 'frozen' | 'banned';
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
    /** 资产信息 */
    asset: OutputAssetListItemDto;
  };

  type OutputFinanceDto = {
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
    /** 财务单号（唯一，业务标识） */
    financeNo: string;
    /** 出租方 ID */
    lessorId: string;
    /** 承租方 ID */
    lesseeId: string;
    /** 账务方向：income（收入）/ expense（支出） */
    direction: 'income' | 'expense';
    /** 收入类型：order_rent（订单租金收入）/ deposit_deduct（押金扣款收入）/ late_fee（逾期费用收入）/ breach_fee（违约费用收入）/ compensation（赔偿收入） */
    incomeType?:
      | 'order_rent'
      | 'deposit_deduct'
      | 'late_fee'
      | 'breach_fee'
      | 'compensation'
      | 'installment'
      | 'renewal_rent';
    /** 支出类型：rent_refund（租金退款）/ withdraw（提现支出） */
    expenseType?: 'rent_refund' | 'withdraw';
    /** 账务状态：pending（待入账）/ confirmed（已入账）/ reversed（已冲正）/ cancelled（已取消） */
    status: 'pending' | 'confirmed' | 'reversed' | 'cancelled';
    /** 资金流状态：crediting（入账中）/ credited（已入账）/ refunding（退款中）/ refunded（已退款）/ withdrawing（提现中）/ withdrawn（已提现） */
    flowStatus?: 'crediting' | 'credited' | 'refunding' | 'refunded' | 'withdrawing' | 'withdrawn';
    /** 币种：CNY（人民币）/ USD（美元）/ EUR（欧元）/ JPY（日元）/ HKD（港币）/ GBP（英镑）/ BTC（比特币）/ ETH（以太坊） */
    currency: 'CNY' | 'USD' | 'EUR' | 'JPY' | 'HKD' | 'GBP' | 'BTC' | 'ETH';
    /** 金额（根据币种单位） */
    amount: number;
    /** 账后余额快照（本条财务记录入账后的出租方可用余额，用于历史对账、审计、快速计算） */
    balanceAfter?: number;
    /** 可用余额影响标识：true（影响可提现余额，如已确认收入、提现）/ false（不影响，如待入账收入） */
    affectAvailable: boolean;
    /** 平台服务费金额（预留字段，用于平台抽成/服务费） */
    platformFeeAmount: number;
    /** 平台服务费率（预留字段，单位：百分比，如 5.5 表示 5.5%） */
    platformFeeRate: number;
    /** 订单 ID */
    orderId?: string;
    /** 订单号（冗余字段） */
    orderNo?: string;
    /** 账单 ID（Payment） */
    paymentId?: string;
    /** 账单号（冗余字段） */
    paymentNo?: string;
    /** 账单支付记录 ID（PaymentRecord） */
    paymentRecordId?: string;
    /** 账单支付记录号（冗余字段） */
    paymentRecordNo?: string;
    /** 押金扣款记录 ID（DepositDeduction） */
    depositDeductionId?: string;
    /** 押金扣款单号（冗余字段） */
    deductionNo?: string;
    /** 退款单 ID（RefundRecord） */
    refundRecordId?: string;
    /** 退款单号（冗余字段） */
    refundNo?: string;
    /** 提现单 ID（WithdrawalRecord） */
    withdrawalRecordId?: string;
    /** 提现单号（冗余字段） */
    withdrawalNo?: string;
    /** 入账时间（确认入账的时间） */
    confirmedAt?: string;
    /** 冲正时间（发生冲正的时间） */
    reversedAt?: string;
    /** 业务发生时间（业务实际发生的时间） */
    businessOccurredAt?: string;
    /** 冲正原因 */
    reverseReason?: string;
    /** 原始财务记录 ID（如果本条记录被冲正，则在原始记录中标记，用于快速判断是否已被冲正） */
    originalFinanceId?: string;
    /** 原始财务记录单号（冗余字段） */
    originalFinanceNo?: string;
    /** 关联的冲正记录 ID（如果本条记录是冲正记录，则关联被冲正的记录） */
    reversedFinanceId?: string;
    /** 关联的冲正记录单号（冗余字段） */
    reversedFinanceNo?: string;
    /** 业务大类：ORDER（订单相关）/ DEPOSIT（押金相关）/ PENALTY（罚金相关）/ COMPENSATION（赔偿相关）/ WITHDRAW（提现相关） */
    businessType?: 'ORDER' | 'DEPOSIT' | 'PENALTY' | 'COMPENSATION' | 'WITHDRAW';
    /** 账务方向标签 */
    directionLabel: string;
    /** 收入类型标签 */
    incomeTypeLabel: string;
    /** 支出类型标签 */
    expenseTypeLabel: string;
    /** 账务状态标签 */
    statusLabel: string;
    /** 资金流状态标签 */
    flowStatusLabel: string;
    /** 币种标签 */
    currencyLabel: string;
    /** 业务大类标签 */
    businessTypeLabel: string;
    /** 是否已被冲正 */
    isReversedByOther: boolean;
    /** 是否为收入 */
    isIncome: boolean;
    /** 是否为支出 */
    isExpense: boolean;
    /** 是否已确认入账 */
    isConfirmed: boolean;
    /** 是否已冲正 */
    isReversed: boolean;
    /** 是否待入账 */
    isPending: boolean;
    /** 是否已取消 */
    isCancelled: boolean;
  };

  type OutputInviteRankItemDto = {
    /** 员工 ID */
    employeeId: string;
    /** 员工昵称/用户名 */
    employeeName: string;
    /** 邀请商户总数 */
    invitedCount: number;
    /** 首单完成数 */
    firstOrderCount: number;
    /** 已发放分润总额（元） */
    totalReleasedRebate: number;
    /** 排名 */
    rank: number;
  };

  type OutputLesseeDepositSummaryDto = {
    /** 当前冻结押金总额（元） */
    frozenDepositTotal: number;
    /** 当前已扣除总额（元） */
    deductedTotal: number;
    /** 累计退还金额（元） */
    refundedTotal: number;
    /** 可释放金额（元）- 资产已归还未退还的押金 */
    releasableAmount: number;
    /** 订单数量（押金已冻结/已支付/部分扣除的订单数） */
    orderCount: number;
  };

  type OutputLesseeOrderStatisticsDto = {
    /** 待支付订单数量 */
    pendingPaymentCount: number;
    /** 使用中订单数量 */
    inUseCount: number;
    /** 已逾期订单数量 */
    overdueCount: number;
    /** 已完成订单数量 */
    completedCount: number;
    /** 售后中（争议中）订单数量 */
    disputeCount: number;
    /** 已支付待收货订单数量 */
    paidPendingReceiveOrderCount: number;
  };

  type OutputLesseeStatisticsDto = {
    /** 订单总数 */
    orderCount: number;
    /** 待支付订单数量 */
    pendingPaymentOrderCount: number;
    /** 押金总金额（元） */
    totalDepositAmount: number;
    /** 收藏的资产数量 */
    favoriteAssetCount: number;
    /** 已支付待收货订单数量 */
    paidPendingReceiveOrderCount: number;
  };

  type OutputLessorFinanceStatisticsDto = {
    /** 累计结算（元） */
    totalSettledAmount: number;
    /** 可提现余额（元） */
    withdrawableBalance: number;
    /** 待入账金额（元） */
    pendingAmount: number;
  };

  type OutputLessorOperationPermissionDto = {
    /** 是否可发起押金扣款申请 */
    canDeductDeposit: boolean;
    /** 不可发起押金扣款时的原因，便于前端展示 */
    canDeductDepositReason?: string;
    /** 是否存在可取消的押金扣款申请（待用户确认/待平台审核） */
    hasCancellableDeductions: boolean;
    /** 不可取消扣款时的说明 */
    canCancelDeductionReason?: string;
    /** 是否可同意/拒绝承租方的取消订单申请 */
    canApproveCancel: boolean;
    /** 是否可商家取消订单（仅待收货状态） */
    canCancelByLessor: boolean;
    /** 是否可结束订单 */
    canEndOrder: boolean;
    /** 是否可强制关闭在租订单（已收货、使用中） */
    canForceClose: boolean;
    /** 不可强制关闭时的原因 */
    canForceCloseReason?: string;
    /** 是否可押金退款 */
    canRefundDeposit: boolean;
    /** 不可押金退款时的原因 */
    canRefundDepositReason?: string;
    /** 是否可发起单笔账单退款（订单未完成且为出租方；具体某笔是否可退以退款接口校验为准） */
    canRefundPaymentRecord: boolean;
    /** 不可发起单笔账单退款时的原因，便于前端展示 */
    canRefundPaymentRecordReason?: string;
    /** 是否可设置超期使用优惠金额（超期使用费用待支付时） */
    canSetOverdueUseDiscount: boolean;
    /** 不可设置超期使用优惠时的原因 */
    canSetOverdueUseDiscountReason?: string;
  };

  type OutputLessorOrderStatisticsDto = {
    /** 待支付订单数量 */
    pendingPaymentCount: number;
    /** 使用中订单数量 */
    inUseCount: number;
    /** 已逾期订单数量 */
    overdueCount: number;
    /** 已完成订单数量 */
    completedCount: number;
    /** 售后中（争议中）订单数量 */
    disputeCount: number;
    /** 已支付待收货订单数量 */
    paidPendingReceiveOrderCount: number;
  };

  type OutputLessorPendingOrderStatisticsDto = {
    /** 已支付数量（待收货） */
    paidCount: number;
    /** 取消订单确认数量 */
    cancelPendingCount: number;
    /** 逾期订单数量（包含超时使用） */
    overdueCount: number;
    /** 已归还待确认数量 */
    returnedPendingCount: number;
    /** 待归还数量 */
    waitReturnCount: number;
    /** 争议中数量 */
    disputeCount: number;
  };

  type OutputLessorStatisticsDto = {
    /** 已发布的资产数量 */
    publishedAssetCount: number;
    /** 总资产数量 */
    totalAssetCount: number;
    /** 进行中的订单数量 */
    inProgressOrderCount: number;
    /** 待处理订单数量 */
    pendingOrderCount: number;
    /** 累计收入（元） */
    totalIncome: number;
  };

  type OutputMerchantAccountDto = {
    /** 总余额（元） */
    totalBalance: string;
    /** 冻结余额（元） */
    frozenBalance: string;
    /** 可提现余额（元） */
    availableBalance: string;
  };

  type OutputMerchantInviteRelationDto = {
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
    /** 邀请员工 ID */
    employeeId: string;
    /** 商户 ID（= userId） */
    merchantId: string;
    /** 使用的邀请码 */
    inviteCode: string;
    /** 关系状态 */
    status: 'registered' | 'verified' | 'listed' | 'first_order';
    /** 认证通过时间 */
    verifiedAt?: string;
    /** 上架达标时间 */
    listedAt?: string;
    /** 首单完成时间 */
    firstOrderAt?: string;
  };

  type OutputMerchantInviteRewardDto = {
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
    /** 员工 ID */
    employeeId: string;
    /** 商户 ID */
    merchantId: string;
    /** 奖励类型 */
    type: 'register' | 'verify' | 'list' | 'first_order' | 'rebate';
    /** 奖励金额（元） */
    amount: number;
    /** 奖励状态 */
    status: 'pending' | 'released' | 'revoked';
    /** 关联订单 ID */
    relatedOrderId?: string;
    /** 实际发放时间 */
    releasedAt?: string;
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
    status: 'UNREAD' | 'READ' | 'DELETED';
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

  type OutputMyAssetListItemDto = {
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
    /** 资产名称 */
    name: string;
    /** 可租数量 */
    availableQuantity: number;
    /** 物流方式（JSON 数组） */
    deliveryMethods: string[];
    /** 物流费用 */
    deliveryFee: number;
    /** 资产描述 */
    description?: string;
    /** 其他说明 */
    notes?: string;
    /** 资产图片（JSON 数组） */
    images: string[];
    /** 资产详情图片（JSON 数组） */
    detailImages?: string[];
    /** 资产封面图（主图 URL） */
    coverImage?: string;
    /** 资产状态：draft（草稿）/ available（可出租）/ offline（下架） */
    status: 'draft' | 'available' | 'offline';
    /** 联系人 */
    contactName: string;
    /** 联系人手机号 */
    contactPhone: string;
    /** 联系人微信号 */
    contactWeChat?: string;
    /** 押金（单位：元） */
    deposit: number;
    /** 是否需要实名认证 */
    requireRealName: boolean;
    /** 资产规格（JSON 对象） */
    specifications?: KeyValuePair[];
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 自定义标签（JSON 数组） */
    customTags?: string[];
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
    /** 评分（0-5，保留2位小数） */
    rating: number;
    /** 是否支持信用免押 */
    creditFreeDeposit: boolean;
    /** 是否是后付费 */
    isPostPayment: boolean;
    /** 资产是否需要归还 */
    needReturn: boolean;
    /** 距离 */
    distance: number;
    /** 资产是否可购买 */
    isBuyable?: boolean;
    /** 是否是商城商品 */
    isMallProduct?: boolean;
    /** 是否自动发货 */
    autoDelivery?: boolean;
    /** 是否需要电子签名 */
    requireElectronicSignature?: boolean;
    /** 联系人 ID */
    contactId: string;
    /** 出租方 ID（资产所有者） */
    ownerId: string;
    /** 资产分类代码 */
    categoryCode: string;
    /** 资产分类名称 */
    categoryName: string;
    /** 资产分类Id */
    categoryId: string;
    /** 审核状态：pending（待审核）/ approved（审核通过）/ rejected（审核拒绝） */
    auditStatus: 'pending' | 'auditing' | 'approved' | 'rejected';
    /** 审核人 ID（后台管理人员） */
    auditById: string;
    /** 审核时间 */
    auditAt?: string;
    /** 上架时间 */
    publishAt: string;
    /** 审核意见/备注 */
    auditRemark?: string;
    /** 浏览次数 */
    viewCount: number;
    /** 收藏次数 */
    favoriteCount: number;
    /** 租赁次数 */
    rentalCount: number;
    /** 评论数量 */
    reviewCount: number;
    /** 1 星评价数量 */
    score1Count: number;
    /** 2 星评价数量 */
    score2Count: number;
    /** 3 星评价数量 */
    score3Count: number;
    /** 4 星评价数量 */
    score4Count: number;
    /** 5 星评价数量 */
    score5Count: number;
    /** 分类列表 */
    category: OutputAssetCategoryBriefDto[];
    /** 标签列表 */
    tags: OutputAssetTagBriefDto[];
    /** 租赁方案列表 */
    rentalPlans: OutputAssetRentalPlanDto[];
    /** 出租方信息 */
    owner: OutputOwnerBriefDto;
    /** 联系人信息 */
    contact: OutputContactDto;
    /** 当前用户是否已收藏该资产 */
    isFavorite?: boolean;
  };

  type OutputMyInviteCodeDto = {
    /** 邀请码 */
    inviteCode: string;
    /** 过期时间 */
    expireAt?: string;
    /** 已邀请商户数 */
    invitedCount: number;
    /** 已认证数 */
    verifiedCount: number;
    /** 已上架数 */
    listedCount: number;
    /** 首单完成数 */
    firstOrderCount: number;
    /** 本月已发放分润（元） */
    monthlyReleasedRebate: number;
    /** 月度封顶（元） */
    monthlyCap: number;
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

  type OutputOwnerBriefDto = {
    /** 用户 ID */
    id: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname?: string;
    /** 头像 */
    avatar?: string;
    /** 是否实名认证 */
    isVerified?: boolean;
    /** 是否企业认证 */
    isEnterpriseVerified?: boolean;
  };

  type OutputPayDepositResultDto = {
    /** 微信支付返回 */
    wxJsapiPay: OutputWxMiniProgramPaymentDto;
    /** 支付宝支付返回 */
    alipayJsapiPay: Record<string, any>;
    /** 是否已支付 */
    isPaid: boolean;
  };

  type OutputPaymentDto = {
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
    /** 支付单号（唯一，业务标识） */
    paymentNo: string;
    /** 订单 ID */
    orderId: string;
    /** 订单号 */
    orderNo: string;
    /** 用户 ID（支付方） */
    userId: string;
    /** 出租方 ID */
    lessorId: string;
    /** 租金金额 */
    rentalAmount: number;
    /** 支付金额，如果是第一笔支付，则包含平台服务费、运费 */
    amount: number;
    /** 已支付金额 */
    paidAmount: number;
    /** 逾期违约金 */
    overduePenalty: number;
    /** 逾期计时费用（单位：元/天） */
    overdueFee: number;
    /** 逾期计时费用单位 */
    overdueFeeUnit: 'day' | 'hour';
    /** 优惠金额（出租方改价优惠） */
    discountAmount: number;
    /** 第三方支付单号 */
    thirdPartyPaymentNo?: string;
    /** 支付回调数据（JSON） */
    callbackData?: Record<string, any>;
    /** 支付失败原因 */
    failureReason?: string;
    /** 支付类型：订单支付（order）/ 分期支付（installment）/ 押金支付（deposit）/ 租金支付（rental）/ 服务费支付（service_fee）/ 违约金支付（penalty）/ 逾期费用支付（overdue_fee）/ 续租支付（renewal） */
    paymentType: 'order' | 'installment' | 'deposit' | 'rental' | 'service_fee' | 'penalty' | 'overdue_fee' | 'renewal';
    /** 账单状态 pending（待支付）/ due（已到期）/ paid（已支付）/ overdue（逾期）/ canceled（已取消） / completed（已完成） / expired（已过期） / partial_completed（部分支付） */
    status:
      | 'generating'
      | 'pending'
      | 'due'
      | 'paid'
      | 'overdue'
      | 'canceled'
      | 'closed'
      | 'expired'
      | 'partial_paid'
      | 'completed';
    /** 退款状态 */
    refundStatus: 'none' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled' | 'partial_refund';
    /** 提现状态 */
    withdrawalStatus: 'none' | 'processing' | 'completed' | 'failed' | 'canceled' | 'partial_withdrawal';
    /** 该账单是否逾期过 */
    isOverdueHistory: boolean;
    /** 是否是分期账单 */
    isInstallment: boolean;
    /** 是否是后付订单 */
    isPostPayment: boolean;
    /** 是否是商品购买支付 */
    isProductPurchase: boolean;
    /** 逾期宽限期，分期订单逾期宽限期，非分期订单逾期宽限期为0 */
    gracePeriod: number;
    /** 支付完成时间 */
    paidAt?: string;
    /** 开始时间 */
    startTime: string;
    /** 结束时间 */
    endTime: string;
    /** 应付时间，如果是分期订单，则时间应该是当天最后时刻，例：2026-01-01 23:59:59 */
    payableTime: string;
    /** 退款时间 */
    refundedAt: string;
    /** 提现时间 */
    withdrawnAt: string;
    /** 续租支付过期时间，过了这个时间如果未支付则需要重新发起续租申请 */
    paymentExpireAt: string;
    /** 分期计划 ID（如果是分期支付） */
    installmentPlanId?: number;
    /** 分期期数（如果是分期支付） */
    rentalPeriod: number;
    /** 当前期数 */
    periodIndex: number;
    /** 是否可以提前支付 */
    canPrepay: boolean;
    /** 状态标签 */
    statusLabel: string;
    /** 逾期罚金单位标签 */
    overdueFeeUnitLabel: string;
    /** 支付类型标签 */
    paymentTypeLabel: string;
    /** 已退款金额 */
    refundedAmount: number;
    /** 是否已全部退款 */
    isAllRefunded: boolean;
    /** 是否已逾期 */
    isOverdue: boolean;
    /** 是否待支付 */
    isPending: boolean;
    /** 是否已支付 */
    isPaid: boolean;
    /** 逾期时间 */
    overdueMinutes: number;
    /** 逾期罚金（动态计算） */
    overdueAmount: number;
    /** 显示逾期罚金，直到支付完成 */
    overdueFineToDisplay: number;
    /** 总应付金额（包含原始金额、逾期违约金和逾期罚金，减去优惠金额）。优惠金额在此处扣除，确保金额计算的唯一来源 */
    totalPayableAmount: number;
    /** 未支付金额（包含逾期费用，已减去优惠金额）。公式：未支付金额 = 总应付金额 - 已支付金额 */
    unpaidAmount: number;
    /** 退款状态标签 */
    refundStatusLabel: string;
    /** 退款记录 */
    refundRecords: OutputRefundRecordDto[];
    /** 支付记录 */
    paymentRecords: OutputPaymentRecordDto[];
    /** 续租信息 */
    renewalInfo: RenewalInfoDto;
  };

  type OutputPaymentRecordDto = {
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
    /** 支付记录单号（唯一，业务标识） */
    recordNo: string;
    /** 支付 ID */
    paymentId?: Record<string, any>;
    /** 支付单号 */
    paymentNo?: Record<string, any>;
    /** 订单 ID */
    orderId: string;
    /** 订单号 */
    orderNo: string;
    /** 用户 ID（支付方） */
    userId: string;
    /** 出租方 ID */
    lessorId: string;
    /** 支付提供商 */
    provider: 'alipay' | 'wechat';
    /** 支付状态 */
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled';
    /** 退款状态 */
    refundStatus?: 'none' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled' | 'partial_refund';
    /** 提现状态 */
    withdrawalStatus?: 'none' | 'processing' | 'completed' | 'failed' | 'canceled' | 'partial_withdrawal';
    /** 支付金额 */
    amount: number;
    /** 第三方支付单号 */
    thirdPartyPaymentNo?: string;
    /** 支付完成时间 */
    paidAt?: string;
    /** 退款时间 */
    refundedAt: string;
    /** 提现时间 */
    withdrawnAt: string;
    /** 支付过期时间 */
    expiredAt?: string;
    /** 支付回调数据（JSON） */
    callbackData?: Record<string, any>;
    /** 支付失败原因 */
    failureReason?: string;
    /** 支付类型： 订单支付（order）/ 分期支付（installment）/ 押金支付（deposit）/ 租金支付（rental）/ 服务费支付（service_fee）/ 违约金支付（penalty）/ 逾期费用支付（overdue_fee） */
    paymentType: string;
    /** 是否是商品购买支付 */
    isProductPurchase: boolean;
    /** 支付状态标签 */
    statusLabel: string;
    /** 退款状态标签 */
    refundStatusLabel: string;
  };

  type OutputPayRentalOrderResultDto = {
    /** 微信支付返回 */
    wxJsapiPay: OutputWxMiniProgramPaymentDto;
    /** 支付宝支付返回 */
    alipayJsapiPay: Record<string, any>;
    /** 是否已支付 */
    isPaid: boolean;
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

  type OutputRefundRecordDto = {
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
    /** 退款单号（唯一，业务标识） */
    refundNo: string;
    /** 支付 ID */
    paymentId: string;
    /** 支付单号 */
    paymentNo: string;
    /** 账单支付记录 ID */
    paymentRecordId: string;
    /** 账单支付记录号 */
    paymentRecordNo: string;
    /** 订单 ID */
    orderId: string;
    /** 订单号 */
    orderNo: string;
    /** 用户 ID（退款接收方） */
    userId: string;
    /** 出租方 ID */
    lessorId: string;
    /** 支付提供商 */
    provider: 'alipay' | 'wechat';
    /** 退款状态 */
    status: 'none' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled' | 'partial_refund';
    /** 退款金额（元） */
    amount: number;
    /** 退款原因 */
    reason?: string;
    /** 第三方退款单号 */
    thirdPartyRefundNo?: string;
    /** 退款完成时间 */
    refundedAt?: string;
    /** 退款回调数据（JSON） */
    callbackData?: Record<string, any>;
    /** 退款失败原因 */
    failureReason?: string;
    /** 退款状态标签 */
    statusLabel: string;
  };

  type OutputRentalOrderDto = {
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
    /** 订单号（唯一，业务标识） */
    orderNo: string;
    /** 是否需要物流 */
    needDelivery: boolean;
    /** 联系人 ID */
    contactId?: string;
    /** 联系人电话 */
    contactPhone: string;
    /** 联系人姓名 */
    contactName: string;
    /** 联系人地址名称 */
    contactAddressName: string;
    /** 联系人快照 */
    contactSnapshot?: OutputContactDto;
    /** 是否是商品购买订单，用于区分租赁订单和商品购买订单 */
    isProductPurchase: boolean;
    /** 订单是否已交易完成 */
    isTransactionCompleted: boolean;
    /** 是否逾期/超时使用 */
    isOverdue: boolean;
    /** 订单主状态：created（已创建）/ pending_receipt（待收货）/ received（已收货）/ completed（已完成）/ canceled（已取消）/ cancel_pending（等待取消确认）/ dispute（争议中）/ closed（强制关闭） */
    status:
      | 'created'
      | 'pending_receipt'
      | 'received'
      | 'completed'
      | 'canceled'
      | 'dispute'
      | 'closed'
      | 'cancel_pending';
    /** 订单支付状态：none（未支付）/ pending（待支付）/ processing（处理中）/ completed（支付成功）/ failed（支付失败）/ timeout（支付超时）/ canceled（支付取消） */
    payStatus: 'none' | 'pending' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled';
    /** 使用状态：none（无使用状态）/ in_use（使用中）/ returned（已归还）/ wait_return（待归还）/ returned_pending（已归还，待确认）/ rejected（拒绝归还） */
    useageStatus: 'none' | 'in_use' | 'returned' | 'wait_return' | 'returned_pending' | 'rejected';
    /** 逾期状态：none（未逾期）/ overdue_use（超时使用）/ overdue（逾期）/ overdue_fee_paid（超时使用费已支付） */
    overdueStatus: 'none' | 'overdue_use' | 'overdue' | 'overdue_fee_paid';
    /** 退款状态：none（无退款）/ processing（退款中）/ completed（退款成功）/ failed（退款失败）/ timeout（退款超时）/ canceled（退款取消）/ partial_refund（部分退款） */
    refundStatus: 'none' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled' | 'partial_refund';
    /** 押金状态：none（无押金）/ pending（待支付）/ frozen（已冻结）/ partial_deducted（部分扣除）/ fully_deducted（已全部扣除）/ unfrozen（已解冻）/ canceled（已取消） */
    depositStatus:
      | 'pending'
      | 'frozen'
      | 'paid'
      | 'partial_deducted'
      | 'fully_deducted'
      | 'unfrozen'
      | 'returned'
      | 'canceled'
      | 'none'
      | 'failed'
      | 'refunding';
    /** 租赁开始日期 */
    startDate?: string;
    /** 租赁结束日期 */
    endDate?: string;
    /** 租赁时长(小时数、天数、周数、月数、季数、年数) */
    duration: number;
    /** 续租次数 */
    renewalCount: number;
    /** 支付过期时间 */
    paymentExpiredAt: string;
    /** 支付完成时间 */
    paidAt: string;
    /** 归还时间 */
    returnedAt: string;
    /** 实际归还时间，出租方确认的归还时间 */
    actualReturnedAt: string;
    /** 归还提交时间 */
    returnedSubmittedAt: string;
    /** 归还确认时间 */
    returnedConfirmedAt: string;
    /** 完成时间 */
    completedAt: string;
    /** 取消时间 */
    canceledAt?: string;
    /** 交付时间/绑定时间 */
    deliveredAt?: string;
    /** 资产实例解绑时间 */
    inventoryUnboundAt?: string;
    /** 收货时间 */
    receivedAt?: string;
    /** 退款时间 */
    refundedAt?: string;
    /** 取消订单，申请退款时间 */
    cancelRefundedAt?: string;
    /** 租金总额 */
    rentalAmount: number;
    /** 押金总额 */
    depositAmount: number;
    /** 平台服务费 */
    platformFee: number;
    /** 优惠金额（汇总字段，实际优惠在账单层面设置） */
    discountAmount: number;
    /** 超期使用优惠备注 */
    overdueUseDiscountRemark?: string;
    /** 订单总金额，包含租金、押金、平台服务费、运费，减去优惠金额 */
    totalAmount: number;
    /** 已支付超时使用费用累计（元） */
    overdueFeePaidAmount: number;
    /** 用户备注 */
    userRemark?: string;
    /** 租赁方案快照（JSON 对象） */
    rentalPlanJson: OutputAssetRentalPlanDto;
    /** 取消原因 */
    cancelReason?: string;
    /** 出租方拒绝取消订单原因 */
    lessorCancelRejectReason?: string;
    /** 分期期数（如果是分期支付） */
    rentalPeriod: number;
    /** 是否是续租订单 */
    isRenewal: boolean;
    /** 是否是分期订单 */
    isInstallment: boolean;
    /** 是否已支付运费 */
    isPaidDeliveryFee: boolean;
    /** 是否已支付平台服务费 */
    isPaidPlatformFee: boolean;
    /** 出租方 ID（资产所有者） */
    lessorId: string;
    /** 承租方 ID（租赁使用者） */
    lesseeId: string;
    /** 资产 ID */
    assetId: string;
    /** 关联的资产实例 ID */
    inventoryId: string;
    /** 预绑定的资产实例编号，支付完成后自动绑定 */
    inventoryCode: string;
    /** 租赁方案 ID（关联到资产租赁方案） */
    rentalPlanId: number;
    /** 分期计划 ID */
    installmentPlanId?: number;
    /** 出租方 */
    lessor: OutputUserDto;
    /** 承租方 */
    lessee: OutputUserDto;
    /** 资产快照 */
    assetSnapshot: OutputAssetListItemDto;
    /** 租赁方案快照 */
    rentalPlanSnapshot: OutputAssetRentalPlanDto;
    /** 资产实例快照 */
    inventorySnapshot: OutputAssetInventorySnapshotDto;
    /** 支付记录 */
    payments: OutputPaymentDto[];
    /** 订单状态 */
    statusLabel: string;
    /** 使用状态 */
    useageStatusLabel: string;
    /** 超时使用时间标签 */
    overdueUseTimeLabel: string;
    /** 逾期状态（超时使用/逾期） */
    overdueStatusLabel: string;
    /** 租赁时长 */
    durationUnitLabel: string;
    /** 订单金额（含平台服务费和运费，已扣除优惠金额，不含押金） */
    orderAmount: number;
    /** 续租总实付金额 */
    totalRenewalPaidAmount: number;
    /** 当前期数 */
    currentPeriodIndex: number;
    /** 是否需要支付押金 */
    needDeposit: boolean;
    /** 已支付金额,包含平台服务费、运费，不含押金 */
    paidAmount: number;
    /** 所有账单的优惠金额总和（实际生效的优惠金额，在账单层面扣除） */
    totalDiscountAmount: number;
    /** 超时使用时间，单位：分钟 */
    overdueUseMinutes: number;
    /** 所有账单的逾期费用总和（包含逾期违约金和逾期罚金） */
    totalPaymentOverdueAmount: number;
    /** 超时使用费用 */
    overdueUseAmount: number;
    /** 应付超时使用费用 */
    payableOverdueUseAmount: number;
    /** 超期使用优惠金额 */
    overdueUseDiscountAmount: number;
    /** 总应付金额（汇总所有账单的总应付金额，账单层面已扣除优惠并加上逾期费用），不含押金 */
    totalPayableAmount: number;
    /** 未支付金额,包含平台服务费、运费、逾期费用，已减去优惠金额，不含押金 */
    unpaidAmount: number;
    /** 已支付完成的期数 */
    completedPeriodCount: number;
    /** 是否待支付 */
    isPending: boolean;
    /** 是否已归还待确认 */
    isReturnedPending: boolean;
    /** 是否待收货 */
    isPendingReceipt: boolean;
    /** 是否是先用后付模式 */
    isPostPayment: boolean;
    /** 押金是否已冻结或已支付 */
    isDepositFrozenOrPaid: boolean;
    /** 是否是无效的订单 */
    isInvalid: boolean;
    /** 已支付租金金额，不含平台服务费、运费 */
    paidRentalAmount: number;
    /** 未支付租金金额，不含平台服务费、运费 */
    unpaidRentalAmount: number;
    /** 第一笔需要支付的租金金额，包含平台服务费、运费、押金 */
    firstPaymentAmount: number;
    /** 退款状态 */
    refundStatusLabel: string;
    /** 押金状态 */
    depositStatusLabel: string;
    /** 押金列表 */
    deposits: OutputDepositDto[];
    /** 是否已支付租金，包含部分支付 */
    isPaidOrPartialPaid: boolean;
    /** 证据列表 */
    evidences: OutputRentalOrderEvidenceDtoWithRentalOrder[];
    /** 取消订单，申请退款剩余时间 */
    cancelRefundConfirmDeadline: number;
    /** 确认归还剩余时间 */
    confirmReturnDeadline: number;
    /** 剩余押金金额 */
    remainingDepositAmount: number;
    /** 续租总支付金额 */
    totalRenewalPaymentAmount: number;
    /** 租金总支付金额，包含分期支付和一次性支付，不包含续租支付 */
    totalPaymentAmount: number;
    /** 是否已全部支付租金 */
    isAllPaidRental: boolean;
    /** 是否部分支付租金 */
    isPartialPaidRental: boolean;
    /** 存在已支付的分期租金，但还有未支付的分期（部分分期已支付，未全部完成） */
    isPaidPartiallyInstallment: boolean;
    /** 是否在使用中 */
    isInUse: boolean;
    /** 是否已收货 */
    isReceived: boolean;
    /** 是否已绑定资产实例 */
    hasBindInventory: boolean;
    /** 是否已归还 */
    isReturned: boolean;
    /** 是否等待取消确认 */
    isCancelPending: boolean;
    /** 是否可以发起押金扣款申请 */
    canDeductDeposit: boolean;
    /** 是否已结束 */
    isOrderEnded: boolean;
    /** 是否可以商家取消订单 */
    canCancelByLessor: boolean;
    /** 是否已支付 */
    isPaid: boolean;
    /** 是否存在待支付的分期租金 */
    hasPendingInstallment: boolean;
    /** 是否存在逾期未支付的分期租金 */
    hasOverduePendingInstallment: boolean;
    /** 关联的资产实例 */
    inventory?: OutputAssetInventoryDtoWithRentalOrder;
    /** 是否可提交评价（承租方） */
    canReview: boolean;
    /** 是否可回复评价（出租方） */
    canReplyToReview: boolean;
  };

  type OutputRentalOrderEvidenceDtoWithRentalOrder = {
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
    /** 租赁订单 ID */
    rentalOrderId: string;
    /** 租赁订单编号 */
    rentalOrderNo: string;
    /** 提交者 ID（承租方或出租方的用户 ID） */
    submitterId: string;
    /** 提交者类型：lessor（出租方）/ lessee（承租方） */
    submitterType: 'lessor' | 'lessee';
    /** 凭证 URL 列表（支持多个凭证） */
    evidenceUrls: string[];
    /** 凭证描述 */
    description?: string;
    /** 凭证类型：asset_delivery：资产交付凭证（出租方交付给承租方）, asset_receipt_confirm：确认收货凭证（承租方确认收到资产，PENDING_RECEIPT -> RECEIVED, useageStatus -> IN_USE）, asset_usage：资产使用/占用凭证（证明某时点仍在使用中）, asset_return：资产归还凭证（承租方提交归还申请）, asset_return_confirm：确认归还凭证（出租方确认收到归还，RETURNED_PENDING -> RETURNED）, asset_return_reject：拒绝归还凭证（出租方拒绝归还申请，RETURNED_PENDING -> DISPUTE）, asset_inspection：资产验收凭证（交付或归还时的验收检测，记录资产状态）, asset_damage：资产损坏凭证, asset_repair：资产维修/处理凭证（维修、检测、处理结果）, asset_loss：资产丢失凭证, deposit_deduction：押金扣除凭证, deposit_refund：押金退还凭证（押金退款相关）, order_cancel：订单取消凭证, order_cancel_reject：拒绝取消订单凭证（出租方拒绝取消订单，DISPUTE -> CANCEL_PENDING）, order_cancel_approve：同意取消订单凭证（出租方同意取消订单，CANCEL_PENDING -> CANCELED）, order_refund：订单退款凭证（订单退款相关）, order_complete：订单完成凭证（出租方结束订单时的凭证）, dispute：争议凭证（沟通记录、申诉材料等）, platform_decision：平台裁决/系统确认凭证（自动确认、仲裁结果）, other：其他凭证 */
    evidenceType?:
      | 'asset_delivery'
      | 'asset_rebind'
      | 'asset_receipt_confirm'
      | 'asset_usage'
      | 'asset_return'
      | 'asset_return_confirm'
      | 'asset_return_reject'
      | 'asset_inspection'
      | 'asset_damage'
      | 'asset_repair'
      | 'asset_loss'
      | 'deposit_deduction'
      | 'deposit_deduction_reject'
      | 'deposit_deduction_approve'
      | 'deposit_refund'
      | 'order_cancel'
      | 'order_cancel_reject'
      | 'order_cancel_approve'
      | 'order_refund'
      | 'order_complete'
      | 'order_force_close'
      | 'dispute'
      | 'platform_decision'
      | 'other';
    /** 关联的订单状态（可选，用于标识是在哪个状态变化时提交的） */
    relatedOrderStatus?: 'none' | 'in_use' | 'returned' | 'wait_return' | 'returned_pending' | 'rejected';
    /** 审核状态：pending（待审核）/ approved（已通过）/ rejected（已拒绝） */
    auditStatus: 'pending' | 'approved' | 'rejected';
    /** 审核意见（审核拒绝时填写） */
    auditRemark?: string;
    /** 审核时间 */
    auditedAt?: string;
    /** 审核人 ID */
    auditorId?: string;
    /** 提交者 */
    submitter: OutputUserDto;
    /** 审核人 */
    auditor: OutputUserDto;
    /** 提交者类型标签 */
    submitterTypeLabel: string;
    /** 审核状态标签 */
    auditStatusLabel: string;
    /** 是否已审核 */
    isAudited: boolean;
    /** 是否审核通过 */
    isApproved: boolean;
    /** 是否审核拒绝 */
    isRejected: boolean;
  };

  type OutputRentalReviewAdminDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 状态标签 */
    statusLabel: string;
    /** 承租方昵称 */
    lesseeNickname?: string;
    /** 承租方 */
    lessee: OutputUserBriefDto;
    /** 出租方 */
    lessor: OutputUserBriefDto;
  };

  type OutputRentalReviewDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（UUID） */
    id: string;
    /** 承租方昵称（脱敏，如 张**） */
    lesseeNickname?: string;
    lessee: OutputUserBriefDto;
  };

  type OutputRentalReviewSummaryDto = {
    /** 已通过审核的评价数量 */
    reviewCount: number;
    /** 平均评分 */
    avgScore: number;
    /** 星级分布 */
    scoreDistribution: Record<string, any>;
  };

  type OutputReportDto = {
    /** 创建时间 */
    createdAt: string;
    /** 主键 ID（自增） */
    id: number;
    /** 举报人 ID */
    reporterId: string;
    /** 被举报资产 ID */
    assetId: string;
    /** 举报原因 */
    reason: string;
    /** 举报说明 */
    description: string;
    /** 图片 URL 数组 */
    images: string[];
    /** 举报状态, 0: 待处理, 1: 举报成立, 2: 举报驳回, 3: 自动关闭 */
    status: 0 | 1 | 2 | 3;
    /** 处理结果 */
    handleResult: string;
    /** 审核人 ID */
    handlerId: string;
    /** 处理时间 */
    handledAt: string;
    /** 举报人昵称（脱敏） */
    reporterNickname?: string;
    /** 资产名称 */
    assetName?: string;
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
    type: 'system' | 'custom';
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
    userType: 'personal' | 'enterprise';
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
    userType: 'personal' | 'enterprise';
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: 'unverified' | 'verified' | 'rejected';
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: 'pending' | 'verified' | 'rejected';
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝） */
    faceRecognitionStatus: 'unverified' | 'verified' | 'rejected';
    /** 实名认证时间 */
    verifiedAt?: string;
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 风险等级：low（低）/ medium（中）/ high（高） */
    riskLevel: 'low' | 'medium' | 'high';
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: 'active' | 'frozen' | 'banned';
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
    /** 头像 URL */
    avatar?: string;
    /** 昵称 */
    nickname?: string;
    /** 个人简介 */
    bio?: string;
    /** 真实姓名（实名认证后） */
    realName?: string;
    /** 性别：unknown/male/female */
    gender: 'unknown' | 'male' | 'female';
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
    userType: 'personal' | 'enterprise';
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: 'unverified' | 'verified' | 'rejected';
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: 'pending' | 'verified' | 'rejected';
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝） */
    faceRecognitionStatus: 'unverified' | 'verified' | 'rejected';
    /** 实名认证时间 */
    verifiedAt?: string;
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 风险等级：low（低）/ medium（中）/ high（高） */
    riskLevel: 'low' | 'medium' | 'high';
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: 'active' | 'frozen' | 'banned';
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

  type OutputUserForLessorDto = {
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
    userType: 'personal' | 'enterprise';
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: 'unverified' | 'verified' | 'rejected';
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: 'pending' | 'verified' | 'rejected';
    /** 企业认证通过时间 */
    enterpriseVerifiedAt?: string;
    /** 人脸识别状态：unverified（未认证）/ verified（已认证）/ rejected（已拒绝） */
    faceRecognitionStatus: 'unverified' | 'verified' | 'rejected';
    /** 实名认证时间 */
    verifiedAt?: string;
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 风险等级：low（低）/ medium（中）/ high（高） */
    riskLevel: 'low' | 'medium' | 'high';
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: 'active' | 'frozen' | 'banned';
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
    status: 'pending' | 'accepted' | 'blocked';
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
    userType: 'personal' | 'enterprise';
    /** 实名认证状态（个人）：unverified/verified/rejected */
    verificationStatus: 'unverified' | 'verified' | 'rejected';
    /** 企业认证状态：pending/verified/rejected，需后台审核 */
    enterpriseVerificationStatus: 'pending' | 'verified' | 'rejected';
    /** 信用评分（0-1000） */
    creditScore: number;
    /** 账户状态：active（正常）/ frozen（冻结）/ banned（封禁） */
    status: 'active' | 'frozen' | 'banned';
    /** 是否已完成认证（个人实名或企业认证通过） */
    isVerified: boolean;
    /** 是否企业认证 */
    isEnterpriseVerified: boolean;
  };

  type OutputUserProfileBriefDto = {
    /** 主键 ID（自增） */
    id: number;
    /** 头像 URL */
    avatar?: string;
    /** 昵称 */
    nickname?: string;
    /** 性别：unknown/male/female */
    gender: 'unknown' | 'male' | 'female';
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
    /** 头像 URL */
    avatar?: string;
    /** 昵称 */
    nickname?: string;
    /** 个人简介 */
    bio?: string;
    /** 真实姓名（实名认证后） */
    realName?: string;
    /** 性别：unknown/male/female */
    gender: 'unknown' | 'male' | 'female';
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
    /** 头像 URL */
    avatar?: string;
    /** 昵称 */
    nickname?: string;
    /** 个人简介 */
    bio?: string;
    /** 真实姓名（实名认证后） */
    realName?: string;
    /** 性别：unknown/male/female */
    gender: 'unknown' | 'male' | 'female';
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

  type OutputWithdrawOrderDto = {
    /** 提现单 ID */
    id: string;
    /** 提现单号 */
    withdrawNo: string;
    /** 提现金额（元） */
    amount: string;
    /** 手续费（元） */
    fee: string;
    /** 实际到账金额（元） */
    actualAmount: string;
    /** 提现方式 */
    withdrawChannel: 'wechat' | 'alipay' | 'bank';
    /** 开户行地址（银行卡时） */
    bankBranchAddress?: string;
    /** 提现状态 */
    status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'canceled' | 'processing' | 'completed' | 'failed';
    /** 申请时间 */
    requestedAt: string;
    /** 审核时间 */
    reviewedAt?: string;
    /** 完成时间 */
    completedAt?: string;
    /** 失败原因 */
    failedReason?: string;
    /** 拒绝原因 */
    rejectReason?: string;
    /** 创建时间 */
    createdAt: string;
  };

  type OutputWxMiniProgramPaymentDto = {
    /** 时间戳，从 1970 年 1 月 1 日 00:00:00 至今的秒数，即当前的时间 */
    timeStamp: string;
    /** 随机字符串，长度为32个字符以下 */
    nonceStr: string;
    /** 统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*** */
    package: string;
    /** 签名算法，应与后台下单时的值一致，如 MD5 或 HMAC-SHA256,RSA */
    signType: 'MD5' | 'HMAC-SHA256' | 'RSA';
    /** 签名，微信小程序调起支付使用的签名串 */
    paySign: string;
  };

  type PaginationMetaDto = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 总数 */
    total: number;
  };

  type PayInstallmentDto = {
    /** 订单 ID */
    orderId: string;
    /** 支付提供商 */
    provider: 'alipay' | 'wechat';
    /** 支付账单 ID */
    paymentId: string;
  };

  type PaymentControllerGetPaymentByIdV1Params = {
    /** 支付 ID */
    id: string;
  };

  type PaymentControllerQueryPaymentsV1Params = {
    /** 页码大小 */
    pageSize?: number;
    /** 当前页码 */
    page?: number;
    /** 关键字 */
    keyword?: string;
    /** 订单 ID */
    orderId?: string;
    /** 订单号 */
    orderNo?: string;
    /** 支付状态 */
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout' | 'canceled';
    /** 支付类型 */
    paymentType?:
      | 'order'
      | 'installment'
      | 'deposit'
      | 'rental'
      | 'service_fee'
      | 'penalty'
      | 'overdue_fee'
      | 'renewal';
    /** 支付提供商 */
    provider?: 'alipay' | 'wechat';
  };

  type PayOverdueUseFeeDto = {
    /** 支付提供商 */
    provider: 'alipay' | 'wechat';
  };

  type PayRenewalDto = {
    /** 续租支付账单 ID */
    paymentId: string;
    /** 支付提供商 */
    provider: 'alipay' | 'wechat';
  };

  type PayRentalOrderDto = {
    /** 订单 ID */
    orderId: string;
    /** 支付提供商 */
    provider: 'alipay' | 'wechat';
  };

  type RealNameAuthDto = {
    /** 真实姓名 */
    realName: string;
    /** 性别 */
    gender?: 'unknown' | 'male' | 'female';
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

  type RebindAssetInventoryDto = {
    /** 目标资产实例 ID（换绑后绑定的实例） */
    inventoryId: string;
    /** 换绑原因/备注 */
    reason?: string;
    /** 换绑留痕图片 URL 列表，用于记录与争议追溯，最多 9 张 */
    evidenceUrls?: string[];
    /** 换绑凭证描述 */
    description?: string;
  };

  type RefreshTokenDto = {
    /** 刷新令牌 */
    refreshToken: string;
  };

  type RefundDepositDto = {
    /** 退款备注 */
    remark?: string;
  };

  type RefundPaymentRecordDto = {
    /** 支付记录 ID（payment_record 表的 ID） */
    paymentRecordId: string;
    /** 退款金额（元），支持部分退款 */
    amount: number;
    /** 退款原因 */
    reason?: string;
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

  type RejectCommunityDto = {
    /** 审核意见（拒绝时必填） */
    auditRemark: string;
  };

  type RejectEnterpriseVerificationDto = {
    /** 拒绝原因（可选，用于通知用户） */
    reason?: string;
  };

  type RejectRentalReviewDto = {
    /** 拒绝原因 */
    rejectReason?: string;
  };

  type RemoveRoleDto = {
    /** 用户 ID */
    userId: string;
    /** 角色代码 */
    roleCode: string;
  };

  type RenewalInfoDto = {
    /** 续租时长 */
    duration: number;
    /** 用户备注 */
    userRemark?: string;
  };

  type RenewalPolicyDto = {
    /** 是否允许续租 */
    allowRenewal: boolean;
    /** 最大续租次数 */
    maxRenewalTimes: number;
    /** 续租折扣 */
    renewalDiscount: number;
    /** 最小续租时长 */
    minDuration: number;
    /** 最大续租时长 */
    maxDuration: number;
    /** 申请续租提前时间 */
    applyBeforeEndMinutes: number;
  };

  type RenewPreviewDto = {
    /** 是否可续租 */
    canRenew: boolean;
    /** 续租租金金额（含折扣） */
    renewalAmount: number;
    /** 续租平台服务费 */
    platformFee: number;
    /** 续租应付总额（续租租金 + 平台费） */
    totalAmount: number;
    /** 续租后的新结束日期 */
    newEndDate: string;
    /** 续租完成后的续租次数 */
    renewalCountAfter: number;
    /** 不可续租时的原因说明 */
    message?: string;
  };

  type RenewRentalOrderDto = {
    /** 续租时长（与原 rentalType 单位一致，如日租为天、小时租为小时） */
    duration: number;
    /** 用户备注 */
    userRemark?: string;
  };

  type RentalOrderRenewControllerPayRenewalV1Params = {
    /** 订单 ID */
    orderId: string;
  };

  type RentalOrderRenewControllerRenewPreviewV1Params = {
    /** 订单 ID */
    orderId: string;
    duration: number;
  };

  type RentalOrderRenewControllerRenewV1Params = {
    /** 订单 ID */
    orderId: string;
  };

  type ReplyRentalReviewDto = {
    /** 回复内容 */
    replyContent: string;
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

  type ReturnAssetDto = {
    /** 归还凭证图片 URL 列表，至少上传1张图片，最多上传9张图片 */
    evidenceUrls: string[];
    /** 归还说明（选填） */
    description?: string;
  };

  type ReviewDepositDeductionDto = {
    /** 是否通过审核 */
    approved: boolean;
    /** 审核通过时的认定扣除金额（元）。不传则使用原申请金额；传则必须大于 0，且不超过原申请金额与押金可用余额的较小值 */
    approvedAmount?: number;
    /** 审核说明（通过或拒绝均可填写） */
    auditDescription?: string;
  };

  type ReviewWithdrawDto = {
    /** 是否通过 */
    approved: boolean;
    /** 拒绝原因（审核拒绝时必填） */
    rejectReason?: string;
  };

  type SendSmsCodeDto = {
    /** 手机号 */
    phoneNumber: string;
    /** 验证码场景 */
    scene: 'register' | 'reset_password' | 'change_password' | 'login';
    /** 图形验证码 ID */
    captchaId?: string;
    /** 图形验证码 */
    captchaCode: string;
  };

  type SetDiscountDto = {
    /** 优惠金额（元），不能超过待支付账单总金额 */
    discountAmount: number;
  };

  type SetOverdueUseDiscountDto = {
    /** 超期使用优惠金额（元），不能超过待付超期费 */
    discountAmount: number;
    /** 超期使用优惠备注（如：友好协商减免、首次逾期减免等） */
    remark?: string;
  };

  type SetPaymentDiscountDto = {
    /** 账单 ID（分期账单或续租账单） */
    paymentId: string;
    /** 优惠金额（元），必须小于该账单金额 */
    discountAmount: number;
  };

  type SimpleOutputAssetInventoryDto = {
    /** 主键 ID（UUID） */
    id: string;
    /** 实例编号（同一资产下的唯一标识） */
    instanceCode: string;
    /** 实例图片 */
    images?: string[];
    /** 实例名称（可选） */
    instanceName?: string;
    /** 实例状态：available（可用）/ rented（已占用）/ maintenance（维护中）/ sold（已出售）/ scraped（已报废）/ damaged（已损坏）/ lost（已丢失） */
    status: 'available' | 'rented' | 'maintenance' | 'sold' | 'scraped' | 'damaged' | 'lost';
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude?: number;
    /** 实例属性（JSON 对象） */
    attributes?: Record<string, any>;
  };

  type UpdateAssetCategoryDto = {
    /** 分类代码（唯一标识，只允许大写字母、数字和下划线） */
    code?: string;
    /** 分类名称 */
    name?: string;
    /** 分类描述 */
    description?: string;
    /** 分类图标（URL 或图标标识） */
    icon?: string;
    /** 排序权重（数字越大越靠前） */
    sortOrder?: number;
    /** 父分类 ID */
    parentId?: string;
    /** 分类属性（JSON 对象，存储扩展属性） */
    attributes?: Record<string, any>;
    /** 是否有效 */
    isActive?: boolean;
  };

  type UpdateAssetCommentDto = {
    /** 留言内容 */
    content?: string;
  };

  type UpdateAssetDto = {
    /** 是否有效 */
    isActive?: boolean;
    /** 资产名称 */
    name?: string;
    /** 物流方式（JSON 数组） */
    deliveryMethods?: string[];
    /** 物流费用 */
    deliveryFee?: number;
    /** 资产描述 */
    description?: string;
    /** 其他说明 */
    notes?: string;
    /** 资产图片（JSON 数组） */
    images?: string[];
    /** 资产详情图片（JSON 数组） */
    detailImages?: string[];
    /** 资产封面图（主图 URL） */
    coverImage?: string;
    /** 押金（单位：元） */
    deposit?: number;
    /** 是否需要实名认证 */
    requireRealName?: boolean;
    /** 资产规格（JSON 对象） */
    specifications?: KeyValuePair[];
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 排序权重（数字越大越靠前） */
    sortOrder?: number;
    /** 是否支持信用免押 */
    creditFreeDeposit?: boolean;
    /** 是否自动发货 */
    autoDelivery?: boolean;
    /** 资产分类Id */
    categoryId?: string;
    /** 是否发布，默认发布 */
    publish?: boolean;
    /** 自定义标签 */
    tags?: string[];
    /** 联系人 ID */
    contactId?: string;
    /** 社区 ID，传入则创建成功后自动关联该社区 */
    communityId?: string;
    /** 租赁计划 */
    rentalPlans: UpdateAssetRentalPlanDto[];
  };

  type UpdateAssetInventoryDto = {
    /** 资产 ID（外键） */
    assetId?: string;
    /** 实例编号（同一资产下的唯一标识） */
    instanceCode?: string;
    /** 实例图片 */
    images?: string[];
    /** 实例名称（可选） */
    instanceName?: string;
    /** 实例状态：available（可用）/ rented（已占用）/ maintenance（维护中）/ sold（已出售）/ scraped（已报废）/ damaged（已损坏）/ lost（已丢失） */
    status?: 'available' | 'rented' | 'maintenance' | 'sold' | 'scraped' | 'damaged' | 'lost';
    /** 经度 */
    longitude?: number;
    /** 纬度 */
    latitude?: number;
    /** 实例属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 实例编号前缀，批量创建时使用 */
    codePrefix?: string;
  };

  type UpdateAssetRentalPlanDto = {
    /** 方案名称 */
    name: string;
    /** 租赁方式：hourly（小时租）/ daily（日租）/ weekly（周租）/ monthly（月租）/ quarterly（季租）/ yearly（年租）/ buy（购买） */
    rentalType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'buy';
    /** 租赁价格（每个租赁单位的租金） */
    price: number;
    /** 押金 */
    deposit: number;
    /** 租赁期数 */
    rentalPeriod: number;
    /** 最短租期（单位：根据租赁方式确定） */
    minPeriod: number;
    /** 逾期计时费用（单位：元/天） */
    overdueFee: number;
    /** 逾期计时费用单位 */
    overdueFeeUnit: 'day' | 'hour';
    /** 违约金（单位：分） */
    penaltyFee: number;
    /** 是否租满后资产归属客户 */
    transferOwnershipAfterRental: boolean;
    /** 是否支持分期租赁 */
    isInstallment: boolean;
    /** 资产属性（JSON 对象） */
    attributes?: Record<string, any>;
    /** 排序权重（数字越大越靠前） */
    sortOrder: number;
    /** 租赁方案 ID */
    id?: number;
  };

  type UpdateChatConversationDto = {
    /** 是否屏蔽会话 */
    blocked?: boolean;
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
    status?: 'UNREAD' | 'READ' | 'DELETED';
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
    gender?: 'unknown' | 'male' | 'female';
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
    status?: 'pending' | 'accepted' | 'blocked';
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
    status?: 'pending' | 'accepted' | 'blocked';
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
    scene: 'register' | 'reset_password' | 'change_password' | 'login';
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
