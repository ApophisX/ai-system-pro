/**
 * 用户中心 - 路径常量与 Mock 数据
 */

export const USER_PATHS = {
  my: {
    root: '/my',
    orders: '/my/orders',
    pendingPayment: '/my/orders?status=created',
    deposit: '/my/deposit',
    favorites: '/my/favorites',
    verify: '/my/verify',
    enterpriseVerify: '/my/enterprise-verify',
    credit: '/my/credit',
    invite: '/my/invite',
    settings: '/my/settings',
    help: '/my/help',
    profileEdit: '/my/profile-edit',
    contact: {
      list: '/my/contact',
    },
  },
  lessor: {
    assets: '/lessor/assets',
    order: {
      root: '/lessor/order',
      management: '/lessor/order/management',
    },
    income: '/lessor/income',
    evaluation: {
      root: '/lessor/evaluation',
    },
  },
  message: {
    center: '/message/center',
  },
} as const;

export const MOCK_UNREAD_MESSAGE_COUNT = 3;
