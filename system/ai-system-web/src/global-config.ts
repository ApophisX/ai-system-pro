import { paths } from 'src/routes/paths';

import packageJson from '../package.json';
import { DEFAULT_LOCATION } from './constants/global-constant';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  areaJsonUrl: string;
  serverUrl: string;
  assetsDir: string;
  amapKey: string; // jsapi key
  amapWebServerKey: string; // web server key
  ossDir: string;
  withdraw: {
    minAmount: number;
    maxAmount: number;
  };
  defaultArea: {
    province: { label: string; value: string } | null;
    city: { label: string; value: string } | null;
    district: { label: string; value: string } | null;
    latitude?: number;
    longitude?: number;
  };
  auth: {
    method: 'jwt' | 'amplify' | 'firebase' | 'supabase' | 'auth0';
    skip: boolean;
    redirectPath: string;
  };
  firebase: {
    appId: string;
    apiKey: string;
    projectId: string;
    authDomain: string;
    storageBucket: string;
    measurementId: string;
    messagingSenderId: string;
  };
  amplify: { userPoolId: string; userPoolWebClientId: string; region: string };
  auth0: { clientId: string; domain: string; callbackUrl: string };
  supabase: { url: string; key: string };
  isDev: boolean;
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  areaJsonUrl: 'https://gelin-window.oss-rg-china-mainland.aliyuncs.com/public/area.json?version=1',
  appName: '藏宝壳',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? '',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  amapKey: import.meta.env.VITE_AMAP_KEY ?? '',
  amapWebServerKey: 'fa89ab1514f1d1a604362c2a083071c4',
  defaultArea: DEFAULT_LOCATION,
  isDev: import.meta.env.VITE_IS_DEV === 'true',
  ossDir: 'xuwu',
  withdraw: {
    minAmount: 0.01,
    maxAmount: 100000,
  },
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.home.root,
  },
  /**
   * Firebase
   */
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APPID ?? '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
  },
  /**
   * Amplify
   */
  amplify: {
    userPoolId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_ID ?? '',
    userPoolWebClientId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID ?? '',
    region: import.meta.env.VITE_AWS_AMPLIFY_REGION ?? '',
  },
  /**
   * Auth0
   */
  auth0: {
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? '',
    domain: import.meta.env.VITE_AUTH0_DOMAIN ?? '',
    callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL ?? '',
  },
  /**
   * Supabase
   */
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
};
