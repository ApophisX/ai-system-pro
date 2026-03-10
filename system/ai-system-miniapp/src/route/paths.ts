export const paths = {
  root: '/pages/index/index',
  discover: '/pages/discover/index',
  book: '/pages/book/index',
  order: {
    list: '/pages/order/list/index',
    detail: '/pages/order/detail/index',
  },
  contact: {
    root: '/pages/contact/index',
    edit: '/pages/contact/edit/index',
  },
  coupon: {
    root: '/pages/coupon/index',
    detail: '/pages/coupon/detail/index',
    exchange: '/pages/coupon/exchange/index',
  },
  share: '/pages/share/index',
  wallet: {
    root: '/pages/wallet/index',
    withdraw: '/pages/wallet/withdraw/index',
    result: '/pages/wallet/result/index',
  },
  mall: {
    order: {
      list: '/pages/mall/order/index',
      detail: '/pages/mall/order/detail/index',
    },
    goods: {
      root: '/pages/mall/goods/index',
      detail: '/pages/mall/goods/detail/index',
    },
    checkout: '/pages/mall/checkout/index',
  },
  user: {
    root: '/pages/user/index',
  },
  partner: {
    recruit: '/pages/partner/recruit/index',
  },
  setting: '/pages/setting/index',
  auth: {
    login: '/pages/auth/login/index',
    logout: '/pages/auth/logout/index',
  },
  goods: {
    list: '/pages/goods/index',
  },
  community: {
    detail: (id: string) => `/pages/community/index?id=${id}`,
    search: '/pages/community/search/index',
    my: '/pages/community/my/index',
    assets: (id: string) => `/pages/community/assets/index?communityId=${id}`,
  },
  payment: '/pages/payment/index',
  scanQrcode: '/pages/scan-qrcode/index',
  /** WebView 页面，传入 url 和可选 title */
  webview: (url: string, title?: string) =>
    `/pages/webview/index?url=${encodeURIComponent(url)}${title ? `&title=${encodeURIComponent(title)}` : ''}`,
};

export const webPaths = {
  goodsDetail: (id: string) => `${APP_URL}/rental/goods/${id}`,
  publish: `${APP_URL}/rental/goods-publish`,
  webviewLogout: `${APP_URL}/auth/embedded/sign-out`,
  myResetPassword: `${APP_URL}/auth/embedded/reset-password`,
  myEnterpriseVerify: `${APP_URL}/my/enterprise-verify`,
  myShopCode: `${APP_URL}/my/shop-code`,
  myOrders: `${APP_URL}/my/orders`,
  myProfileEdit: `${APP_URL}/my/profile-edit`,
  myDeposit: `${APP_URL}/my/deposit`,
  myFavorites: `${APP_URL}/my/favorites`,
  messageCenter: `${APP_URL}/message/center`,
  myContactList: `${APP_URL}/my/contact`,
  myVerify: `${APP_URL}/my/verify`,
  myCredit: `${APP_URL}/my/credit`,
  myInvite: `${APP_URL}/my/invite`,
  myHelp: `${APP_URL}/my/help`,
  lessorAssets: `${APP_URL}/lessor/assets`,
  lessorOrder: `${APP_URL}/lessor/order`,
  lessorIncome: `${APP_URL}/lessor/income`,
  lessorOrderManagement: `${APP_URL}/lessor/order/management`,
  lessorEvaluationRoot: `${APP_URL}/lessor/evaluation`,
  community: {
    root: `${APP_URL}/community`,
    search: `${APP_URL}/community/search`,
    create: `${APP_URL}/community/create`,
    detail: (id: string) => `${APP_URL}/community/${id}`,
    /** 社区资产列表（需已加入） */
    assets: (id: string) => `${APP_URL}/community/${id}/assets`,
    my: `${APP_URL}/community/my`,
  },
  terms: {
    userAgreement: `${APP_URL}/terms/user-agreement.html`,
    privacyPolicy: `${APP_URL}/terms/privacy.html`,
    about: `${APP_URL}/terms/about.html`,
  },
};
