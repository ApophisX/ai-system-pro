declare global {
  namespace WeChatAuth {
    // 小程序登录响应
    interface MiniProgramLoginResponse {
      openid: string;
      session_key: string;
      unionid?: string;
      errcode?: number;
      errmsg?: string;
    }

    // Access Token 响应
    interface AccessTokenResponse {
      access_token: string;
      expires_in: number;
      errcode?: number;
      errmsg?: string;
    }

    // 解密后的用户信息
    interface DecryptedUserInfo {
      openId: string;
      nickName: string;
      gender: number;
      language: string;
      city: string;
      province: string;
      country: string;
      avatarUrl: string;
      unionId?: string;
      watermark: {
        timestamp: number;
        appid: string;
      };
    }

    // 手机号响应
    interface PhoneNumberResponse {
      errcode: number;
      errmsg: string;
      phone_info: {
        phoneNumber: string;
        purePhoneNumber: string;
        countryCode: string;
        watermark: {
          timestamp: number;
          appid: string;
        };
      };
    }
  }
}

// 必须要有这一行，否则上面的声明不会生效
export {};
