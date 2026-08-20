// every role the platform recognises, from institution wide admins to clinical staff
export type TUserRole =
  | 'super-admin'
  | 'domain-admin'
  | 'admin'
  | 'faculty'
  | 'student'
  | 'doctor'
  | 'accountant';

export type TUserStatus = 'in-progress' | 'blocked';

export type TUser = {
  id: string;
  email?: string;
  password: string;
  needsPasswordChange: boolean;
  role: TUserRole;
  status: TUserStatus;
  // demo accounts can read everything but are blocked from mutating sandbox data
  isDemo: boolean;
  isDeleted: boolean;
};
