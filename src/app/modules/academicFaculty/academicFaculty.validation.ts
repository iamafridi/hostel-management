import z from 'zod';

const academicFacultyValidationSchema = z.object({
    name: z.string({
        invalid_type_error: 'Faculty name needs to be a string',
    }),
});

export const academicFacultyValidation = {
    academicFacultyValidationSchema,
};
