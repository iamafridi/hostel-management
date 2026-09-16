import z from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    identifier: z
      .string({ error: 'Email or ID is required' })
      .trim()
      .min(1, 'Email or ID is required'),
    password: z
      .string({ error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string().trim().min(1, 'Refresh token is required'),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .max(32, 'New password can not be more than 32 characters'),
  }),
});

export const AuthValidations = {
  loginValidationSchema,
  refreshTokenValidationSchema,
  changePasswordValidationSchema,
};
