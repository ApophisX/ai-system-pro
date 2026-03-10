import type { UserConfigExport } from '@tarojs/cli';

export default {
  logger: {
    quiet: false,
    stats: true,
  },
  defineConstants: {
    // APP_API_HOST: JSON.stringify('https://xunwu-api.openworkai.com'),
    // APP_URL: JSON.stringify('https://xunwu.openworkai.com'),
    // APP_API_HOST: JSON.stringify('http://cbk-api.niuhuifei.cn'),
    // APP_URL: JSON.stringify('http://192.168.50.92:9091'),
    // APP_API_HOST: JSON.stringify("http://192.168.50.92:3456"),
    // APP_URL: JSON.stringify("http://192.168.2.96:9091"),
    // APP_URL: JSON.stringify("http://192.168.1.133:9091"),
  },
  mini: {},
  h5: {},
} satisfies UserConfigExport<'webpack5'>;
