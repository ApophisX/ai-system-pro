// ----------------------------------------------------------------------

import { CONFIG } from 'src/global-config';

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  RENTAL: '/rental',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
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
    management: {
      root: `${ROOTS.DASHBOARD}/management`,
      user: {
        root: `${ROOTS.DASHBOARD}/management/user`,
        list: `${ROOTS.DASHBOARD}/management/user/list`,
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
  },
  // 消息
  message: {
    root: '/message',
    center: '/message/center',
  },
  // 我的
  my: {
    root: '/my',
    favorites: '/my/favorites',
    verify: '/my/verify',
    /** 企业认证（出租方身份可见，商户入驻需完成） */
    enterpriseVerify: '/my/enterprise-verify',
    invite: '/my/invite',
    /** 商户邀请（仅员工 merchant_inviter/bd 可见） */
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
  book: '/pages/book/index',
  order: {
    list: '/pages/order/list/index',
    detail: '/pages/order/detail/index',
  },
  user: {
    root: '/pages/user/index',
  },
  setting: '/pages/setting/index',
  auth: {
    login: '/pages/auth/login/index',
    logout: '/pages/auth/logout/index',
  },
  payment: '/pages/payment/index',
  scanQrcode: '/pages/scan-qrcode/index',
  /** WebView 页面，传入 url 和可选 title */
  webview: (url: string, title?: string) =>
    `/pages/webview/index?url=${encodeURIComponent(url)}${title ? `&title=${encodeURIComponent(title)}` : ''}`,
};
