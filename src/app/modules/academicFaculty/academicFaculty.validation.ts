import z from 'zod';

const createAcademicFacultyValidationSchema = z.object({
    body: z.object({
        name: z.string({
            invalid_type_error: 'Faculty name needs to be a string',
        }),
    }),
});
const updateAcademicFacultyValidationSchema = z.object({
    body: z.object({
        name: z.string({
            invalid_type_error: 'Faculty name needs to be a string',
        }),
    }),
});

export const AcademicFacultyValidation = {
    createAcademicFacultyValidationSchema,
    updateAcademicFacultyValidationSchema,
};
