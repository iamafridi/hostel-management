import z from 'zod';

const PreRequisiteCourseValidationSchema = z.object({
    course: z.string(),
    isDeleted: z.boolean().optional(),
});


const DueCourseValidationSchema = z.object({
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
        isDeleted: z.boolean().optional(),
        preRequisiteCourses: z.array(PreRequisiteCourseValidationSchema).optional(),
        dueCourses: z.array(DueCourseValidationSchema).optional(),
    }),
});

const updatePreRequisiteCourseValidationSchema = z.object({
    course: z.string(),
    isDeleted: z.boolean().optional(),
});


const updateDueCourseValidationSchema = z.object({
    course: z.string(),
    isDeleted: z.boolean().optional(),
});

const updateCourseValidationSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1).optional(),
        prefix: z.string().trim().min(1).optional(),
        code: z.number().int('Code must be an integer').nonnegative().optional(),
        credits: z.number().nonnegative().optional(),
        dues: z.number().nonnegative().optional(),
        isDeleted: z.boolean().optional(),
        preRequisiteCourses: z
            .array(updatePreRequisiteCourseValidationSchema)
            .optional(),
        dueCourses: z
            .array(updateDueCourseValidationSchema)
            .optional(),
    }),
});

const facultiesWithCourseValidationSchema = z.object({
    body: z.object({
        faculties: z.array(z.string()),
    }),
});

export const CourseValidations = {
    createCourseValidationSchema,
    updateCourseValidationSchema,
    facultiesWithCourseValidationSchema,
};