import { TUserRole } from '../user/user.interface';

export type TLoginPayload = {
  identifier: string;
  password: string;
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TAuthProfile = {
  userId: string;
  id: string;
  email?: string;
  role: TUserRole;
  isDemo: boolean;
  needsPasswordChange: boolean;
};

export type TLoginResult = {
  user: TAuthProfile;
  tokens: TAuthTokens;
};

export type TChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export type TDemoAccount = {
  role: TUserRole;
  label: string;
  email: string;
  id: string;
};
