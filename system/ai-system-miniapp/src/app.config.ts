export default defineAppConfig({
  pages: [
    'pages/discover/index',
    'pages/community/index',
    'pages/community/search/index',
    'pages/community/assets/index',
    'pages/home/index',
    'pages/publish/index',
    'pages/message/index',
    'pages/webview/index',
    'pages/goods/index',
    'pages/auth/login/index',
    'pages/scan-qrcode/index',
    'pages/payment/index',
    'pages/auth/logout/index',
    'pages/user/index',
    'pages/book/index',
    'pages/order/list/index',
    'pages/setting/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    // custom: true,
    color: '#999999', // 未选中文字颜色
    selectedColor: '#009488', // 选中文字颜色
    backgroundColor: '#ffffff', // 背景色
    borderStyle: 'black', // 上边框颜色，可选 black / white
    list: [
      {
        pagePath: 'pages/discover/index', // 页面路径
        text: '发现', // tab文字
        iconPath: `assets/icon/icon-discover.png`,
        selectedIconPath: `assets/icon/icon-discover-active.png`,
      },
      {
        pagePath: 'pages/community/index',
        text: '社区',
        iconPath: `assets/icon/icon-community.png`,
        selectedIconPath: `assets/icon/icon-community-active.png`,
      },
      {
        pagePath: 'pages/publish/index', // 页面路径
        text: '发布好物', // tab文字
        iconPath: `assets/icon/icon-publish.png`,
        selectedIconPath: `assets/icon/icon-publish-active.png`,
      },
      {
        pagePath: 'pages/message/index',
        text: '消息通知',
        iconPath: `assets/icon/icon-bell.png`,
        selectedIconPath: `assets/icon/icon-bell-active.png`,
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: `assets/icon/icon-user.png`,
        selectedIconPath: `assets/icon/icon-user-active.png`,
      },
    ],
  },
  permission: {
    'scope.userLocation': {
      desc: '获取您的位置信息，以便提供相关位置服务和更好的功能体验',
    },
  },
  requiredPrivateInfos: ['getLocation', 'chooseLocation'],
});
