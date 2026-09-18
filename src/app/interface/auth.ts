import { TUserRole } from '../modules/user/user.interface';

// the subset of the user that travels on every authenticated request
export type TAuthUser = {
  userId: string;
  id: string;
  email?: string;
  role: TUserRole;
  isDemo: boolean;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TAuthUser;
    }
  }
}
