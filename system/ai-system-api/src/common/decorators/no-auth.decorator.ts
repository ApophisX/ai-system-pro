import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_API_KEY = 'noAuth';
export const NoAuth = (): CustomDecorator<string> => {
  return SetMetadata(IS_PUBLIC_API_KEY, true);
};
