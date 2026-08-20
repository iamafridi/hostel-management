import { TUserRole } from './user.interface';

export const USER_ROLES: TUserRole[] = [
  'super-admin',
  'domain-admin',
  'admin',
  'faculty',
  'student',
  'doctor',
  'accountant',
];

// roles that may create or change institutional data
export const MANAGEMENT_ROLES: TUserRole[] = [
  'super-admin',
  'domain-admin',
  'admin',
];

// searchable fields used by the generic query builder for user lookups
export const userSearchableFields = ['id', 'email'];
