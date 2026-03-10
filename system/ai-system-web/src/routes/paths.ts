// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  RENTAL: '/rental',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    embedded: {
      resetPassword: `${ROOTS.AUTH}/embedded/reset-password`,
      updatePassword: `${ROOTS.AUTH}/embedded/update-password`,
    },
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
      /** 带邀请码的注册链接（商户邀请场景） */
      signUpWithInvite: (inviteCode: string) =>
        `${ROOTS.AUTH}/jwt/sign-up?inviteCode=${encodeURIComponent(inviteCode)}`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
    management: {
      root: `${ROOTS.DASHBOARD}/management`,
      enterprise: `${ROOTS.DASHBOARD}/management/enterprise`,
      order: {
        root: `${ROOTS.DASHBOARD}/management/order`,
        // 押金扣除审核
        depositAudit: `${ROOTS.DASHBOARD}/management/order/deposit-audit`,
      },
      asset: {
        root: `${ROOTS.DASHBOARD}/management/asset`,
        list: `${ROOTS.DASHBOARD}/management/asset/list`,
      },
      review: {
        root: `${ROOTS.DASHBOARD}/management/review`,
        list: `${ROOTS.DASHBOARD}/management/review/list`,
      },
      report: {
        root: `${ROOTS.DASHBOARD}/management/report`,
        list: `${ROOTS.DASHBOARD}/management/report/list`,
      },
      user: {
        root: `${ROOTS.DASHBOARD}/management/user`,
        list: `${ROOTS.DASHBOARD}/management/user/list`,
      },
      community: {
        root: `${ROOTS.DASHBOARD}/management/community`,
        list: `${ROOTS.DASHBOARD}/management/community`,
      },
    },
  },
  //
  home: {
    root: '/',
  },
  rental: {
    root: ROOTS.RENTAL,
    goods: {
      root: `${ROOTS.RENTAL}/goods`,
      detail: (id: string) => `${ROOTS.RENTAL}/goods/${id}`,
    },
    category: {
      root: `${ROOTS.RENTAL}/category`,
    },
    orderConfirm: {
      root: (id: string) => `${ROOTS.RENTAL}/order-confirm/${id}`,
    },
    goodsPublish: {
      root: `${ROOTS.RENTAL}/goods-publish`,
    },
    /** 出租方店铺（承租方扫码/链接查看出租方全部资产） */
    shop: (lessorId: string) => `${ROOTS.RENTAL}/shop/${lessorId}`,
    report: {
      root: (id: string) => `${ROOTS.RENTAL}/goods/${id}/report`,
      success: (id: string) => `${ROOTS.RENTAL}/goods/${id}/report/success`,
    },
    review: {
      root: `${ROOTS.RENTAL}/review`,
      withAsset: (assetId: string) => `${ROOTS.RENTAL}/review?assetId=${assetId}`,
    },
  },

  // 社区
  community: {
    root: '/community',
    search: '/community/search',
    create: '/community/create',
    detail: (id: string) => `/community/${id}`,
    /** 社区资产列表（需已加入） */
    assets: (id: string) => `/community/${id}/assets`,
    my: '/community/my',
  },
  // 消息
  message: {
    root: '/message',
    center: '/message/center',
  },
  // 我的
  my: {
    root: '/my',
    orders: '/my/orders',
    orderDetail: (id: string) => `/my/orders/${id}`,
    orderReview: (orderId: string) => `/my/orders/${orderId}/review`,
    orderInstallments: (id: string) => `/my/orders/${id}/installments`,
    orderDepositRecords: (id: string) => `/my/orders/${id}/deposit-records`,
    /** 订单支付明细（已支付/部分支付的账单） */
    orderPayments: (id: string) => `/my/orders/${id}/payments`,
    /** 订单退款记录 */
    orderRefundRecords: (id: string) => `/my/orders/${id}/refund-records`,
    pendingPayment: '/my/orders?status=created',
    deposit: '/my/deposit',
    favorites: '/my/favorites',
    verify: '/my/verify',
    /** 企业认证（出租方身份可见，商户入驻需完成） */
    enterpriseVerify: '/my/enterprise-verify',
    credit: '/my/credit',
    invite: '/my/invite',
    /** 商户邀请（仅员工 merchant_inviter/bd 可见） */
    merchantInvite: '/my/merchant-invite',
    settings: '/my/settings',
    help: '/my/help',
    /** 条款与政策（iframe 展示 HTML） */
    terms: {
      about: '/my/terms/about',
      privacy: '/my/terms/privacy',
      userAgreement: '/my/terms/user-agreement',
    },
    profileEdit: '/my/profile-edit',
    contact: {
      root: '/my/contact',
      list: '/my/contact',
      edit: (id: string) => `/my/contact/edit/${id}`,
    },
  },
  // 出租方
  lessor: {
    assets: {
      root: '/lessor/assets',
      inventory: {
        list: (id: string) => `/lessor/assets/${id}/inventory`,
        create: (id: string) => `/lessor/assets/${id}/inventory/create`,
        detail: (assetId: string, instanceId: string) =>
          `/lessor/assets/${assetId}/inventory/${instanceId}`,
        edit: (assetId: string, instanceId: string) =>
          `/lessor/assets/${assetId}/inventory/${instanceId}/edit`,
      },
      // inventory: (id: string) => `/lessor/assets/${id}/inventory`,
      // inventoryCreate: (id: string) => `/lessor/assets/${id}/inventory/create`,
      // inventoryEdit: (assetId: string, instanceId: string) =>
      //   `/lessor/assets/${assetId}/inventory/${instanceId}/edit`,
      preview: (id: string) => `/lessor/assets/${id}/preview`,
      edit: (id: string) => `/lessor/assets/${id}/edit`,
    },
    order: {
      root: '/lessor/order',
      list: '/lessor/order/list', // 列表
      detail: (id: string) => `/lessor/order/detail/${id}`, // 详情
      bindAsset: (id: string) => `/lessor/order/detail/${id}/bind-asset`, // 绑定资产
      rebindAsset: (id: string) => `/lessor/order/detail/${id}/rebind-asset`, // 换绑资产
      installments: (id: string) => `/lessor/order/installments/${id}`, // 分期
      management: '/lessor/order/management', // 管理
    },
    income: '/lessor/income',
    withdraw: {
      root: '/lessor/withdraw',
      apply: '/lessor/withdraw/apply',
      detail: (id: string) => `/lessor/withdraw/${id}`,
    },
    evaluation: {
      root: '/lessor/evaluation',
      detail: (id: string) => `/lessor/evaluation/${id}`,
    },
  },
  // 支付
  payment: {
    success: '/payment/success',
    failure: '/payment/failure',
    processing: '/payment/processing',
  },
};

// 宿主页面路径
export const hostPaths = {
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
  payment: '/pages/payment/index',
  scanQrcode: '/pages/scan-qrcode/index',
  /** WebView 页面，传入 url 和可选 title */
  webview: (url: string, title?: string) =>
    `/pages/webview/index?url=${encodeURIComponent(url)}${title ? `&title=${encodeURIComponent(title)}` : ''}`,
};
