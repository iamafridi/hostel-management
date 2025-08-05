import z from 'zod';

const createAcademicSemesterValidationSchema = z.object({
    password: z
        .string({
            invalid_type_error: 'Password needs to be a string',
        })
        .max(20, {
            message: 'Password cannot be more than 20 characters',
        })
        .optional(),
});

export const userValidation = {
    createAcademicSemesterValidationSchema,
};
