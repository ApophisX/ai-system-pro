import * as zod from 'zod';

import { AuthLoginType } from 'src/constants/global-constant';

export const SignInSchema = zod
  .object({
    phoneOrEmail: zod
      .string()
      .min(1, { message: '请输入手机号!' })
      .regex(/^1\d{10}$/, '请输入正确的手机号'),
    captchaCode: zod.string().optional(),
    type: zod.enum(AuthLoginType), // 1: 密码登录, 2: 短信验证码登录
    password: zod.string().optional(),
    code: zod.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === AuthLoginType.PASSWORD) {
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: !data.password ? '请输入密码!' : '密码长度不能少于6位!',
        });
      }
      if (!data.captchaCode || data.captchaCode.length !== 4) {
        ctx.addIssue({
          code: 'custom',
          path: ['captchaCode'],
          message: !data.captchaCode ? '请输入验证码!' : '验证码格式不正确!',
        });
      }
    } else if (data.type === AuthLoginType.SMS) {
      if (!data.code || data.code.length !== 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['code'],
          message: !data.code ? '请输入短信验证码!' : '请输入六位短信验证码!',
        });
      }
    } else {
      ctx.addIssue({
        code: 'custom',
        path: ['phoneOrEmail'],
        message: '登录方式错误!',
      });
    }
  });
export type SignInSchemaType = zod.infer<typeof SignInSchema>;
