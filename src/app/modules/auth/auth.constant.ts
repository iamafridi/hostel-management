import { TDemoAccount } from './auth.interface';

// built in sandbox identities so reviewers can explore every role without seeding
export const DEMO_ACCOUNTS: TDemoAccount[] = [
  {
    role: 'super-admin',
    label: 'Super Admin',
    email: 'super.admin@college.edu',
    id: 'SA-0001',
  },
  {
    role: 'domain-admin',
    label: 'Clinical Domain Admin',
    email: 'domain.admin@college.edu',
    id: 'DA-0001',
  },
  {
    role: 'faculty',
    label: 'Faculty',
    email: 'demo.faculty@erp.demo',
    id: 'F-0001',
  },
  {
    role: 'student',
    label: 'Student',
    email: 'demo.student@erp.demo',
    id: '2030010001',
  },
  {
    role: 'doctor',
    label: 'Clinical Supervisor',
    email: 'demo.doctor@erp.demo',
    id: 'DOC-0001',
  },
  {
    role: 'accountant',
    label: 'Accountant',
    email: 'demo.accountant@erp.demo',
    id: 'AC-0001',
  },
];

export const DEMO_ACCOUNT_PASSWORD = 'Demo@123';
