import wx from 'weixin-js-sdk';

import { PlatformDetector } from 'src/utils';

export function scanQRCode() {
  return new Promise((resolve, reject) => {
    wx.scanQRCode({
      needResult: 0,
      scanType: ['qrCode'],
      success: (result: any) => {
        resolve(result);
      },
    });
    if (PlatformDetector.isWeChatMiniProgram()) {
      //
    }
  });
}

export function navigateTo(url: string) {
  return new Promise((resolve, reject) => {
    if (PlatformDetector.isWeChatMiniProgram()) {
      wx.miniProgram.navigateTo({
        url,
        success: () => {
          resolve(true);
        },
      });
    }
  });
}

export function navigateBack(url: string) {
  return new Promise((resolve, reject) => {
    if (PlatformDetector.isWeChatMiniProgram()) {
      wx.miniProgram.navigateBack({
        url,
        success: () => {
          resolve(true);
        },
      });
    }
  });
}

export function getMiniProgramWebviewUrl(url: string, title?: string) {
  return `/pages/webview/index?useHost=true&url=${encodeURIComponent(url)}${title ? `&title=${encodeURIComponent(title)}` : ''}`;
}
