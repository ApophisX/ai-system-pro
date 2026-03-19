export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/auth/login/index',
    'pages/payment/index',
    'pages/auth/logout/index',
    'pages/user/index',
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
        pagePath: 'pages/home/index', // 页面路径
        text: '首页', // tab文字
        iconPath: `assets/icon/icon-home.png`,
        selectedIconPath: `assets/icon/icon-home-active.png`,
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
