import z from 'zod';

const feeHeadValidationSchema = z.object({
  head: z.string().trim().min(1, 'Fee head is required'),
  category: z.enum([
    'tuition',
    'hostel',
    'transport',
    'library',
    'laboratory',
    'examination',
    'other',
  ]),
  amount: z.number().nonnegative('Fee head amount can not be negative'),
});

const createFeeValidationSchema = z.object({
  body: z.object({
    student: z.string().trim().min(1, 'Student is required'),
    academicSemester: z.string().trim().min(1, 'Academic semester is required'),
    academicDepartment: z.string().trim().min(1).optional(),
    feeHeads: z
      .array(feeHeadValidationSchema)
      .min(1, 'At least one fee head is required'),
    discount: z.number().nonnegative().optional(),
    lateFee: z.number().nonnegative().optional(),
    dueDate: z.string().trim().min(1, 'Due date is required'),
    remarks: z.string().trim().optional(),
  }),
});

const generateBulkFeesValidationSchema = z.object({
  body: z.object({
    students: z
      .array(z.string().trim().min(1))
      .min(1, 'At least one student is required'),
    academicSemester: z.string().trim().min(1, 'Academic semester is required'),
    academicDepartment: z.string().trim().min(1).optional(),
    feeHeads: z
      .array(feeHeadValidationSchema)
      .min(1, 'At least one fee head is required'),
    dueDate: z.string().trim().min(1, 'Due date is required'),
    discount: z.number().nonnegative().optional(),
    lateFee: z.number().nonnegative().optional(),
    remarks: z.string().trim().optional(),
  }),
});

const updateFeeValidationSchema = z.object({
  body: z.object({
    feeHeads: z.array(feeHeadValidationSchema).min(1).optional(),
    discount: z.number().nonnegative().optional(),
    lateFee: z.number().nonnegative().optional(),
    dueDate: z.string().trim().min(1).optional(),
    remarks: z.string().trim().optional(),
  }),
});

export const FeeValidations = {
  createFeeValidationSchema,
  generateBulkFeesValidationSchema,
  updateFeeValidationSchema,
};
