import z from 'zod';

const createAcademicDepartmentValidationSchema = z.object({
  body: z.object({
    name: z.string({
      error: 'Department name needs to be a string',
    }),
    academicFaculty: z.string({
      error: 'Faculty is required',
    }),
  }),
});
const updateAcademicDepartmentValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: 'Department name needs to be a string',
      })
      .optional(),
    academicFaculty: z
      .string({
        error: 'Faculty is required',
      })
      .optional(),
  }),
});

export const AcademicDepartmentValidation = {
  createAcademicDepartmentValidationSchema,
  updateAcademicDepartmentValidationSchema,
};

//----> Service.js
