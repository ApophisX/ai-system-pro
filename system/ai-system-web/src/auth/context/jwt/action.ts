import type { SmsScene } from 'src/constants/global-constant';
import type { SignInSchemaType } from 'src/auth/schema/sign-in-schema';

import { encryptPhone } from 'src/utils/utils';

import API from 'src/services/API';
import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';

// ----------------------------------------------------------------------

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** 邀请码（商户邀请场景，可选） */
  inviteCode?: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signIn = async (data: SignInSchemaType): Promise<void> => {
  try {
    const res = await axios.post<MyApi.ApiResponseOutputAuthDto>(endpoints.auth.signIn, data, {
      fetchOptions: {
        showSuccess: false,
      },
    });

    const { accessToken, refreshToken } = res.data.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken, refreshToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async (params: MyApi.RegisterDto): Promise<void> => {
  try {
    const res = await API.Auth.AuthControllerSignUpV1(params);

    const { accessToken, refreshToken } = res.data.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }
    // localStorage.setItem(JWT_STORAGE_KEY, accessToken);
    setSession(accessToken, refreshToken);
  } catch (error) {
    console.error('注册过程中发生错误：', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

/** **************************************
 * Send Code
 *************************************** */
export const sendCode = async (params: {
  scene: SmsScene;
  phoneNumber: string;
  captchaCode: string;
}) =>
  API.Sms.SmsControllerSendCodeV1(params, {
    fetchOptions: {
      showError: true,
      showSuccess: true,
      successMessage: `验证码已发送至您${encryptPhone(params.phoneNumber)}的手机号上，请注意查收`,
    },
  });
