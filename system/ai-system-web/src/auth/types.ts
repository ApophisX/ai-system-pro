export type UserType = MyApi.OutputUserDetailDto;

export type AuthState = {
  user: UserType | null;
  loading: boolean;
};

export type AuthContextValue = {
  unid: string;
  user: UserType | null;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
