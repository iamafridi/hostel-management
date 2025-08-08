import z from 'zod';

const createAcademicFacultyValidationSchema = z.object({
    name: z.string({
        invalid_type_error: 'Faculty name needs to be a string',
    }),
});
const updateAcademicFacultyValidationSchema = z.object({
    name: z.string({
        invalid_type_error: 'Faculty name needs to be a string',
    }),
});

export const AcademicFacultyValidation = {
    createAcademicFacultyValidationSchema, updateAcademicFacultyValidationSchema
};
