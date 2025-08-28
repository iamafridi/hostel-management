import z from 'zod';

const PreRequisiteCourseValidationSchema = z.object({
    course: z.string(),
    isDeleted: z.boolean().optional(),
});

const createCourseValidationSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1).optional(),
        prefix: z.string().trim().min(1).optional(),
        code: z.number().int('Code must be an integer').nonnegative().optional(),
        credits: z.number().nonnegative().optional(),
        dues: z.number().nonnegative().optional(),
        preRequisiteCourses: z.array(PreRequisiteCourseValidationSchema).optional(),
    }),
});

export const CourseValidations = {
    createCourseValidationSchema,
};
