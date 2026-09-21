import z from 'zod';
import {
  CompetencyLevels,
  ProcedureCategories,
  RotationStatuses,
  SignOffStatuses,
} from './clinical.constant';

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'A valid Mongo object id is required');

const createRotationValidationSchema = z.object({
  body: z.object({
    student: objectId,
    course: objectId.optional(),
    academicDepartment: objectId.optional(),
    academicSemester: objectId.optional(),
    supervisor: objectId.optional(),
    hospital: z.string().trim().min(1, 'Hospital is required'),
    ward: z.string().trim().min(1, 'Ward is required'),
    startDate: z.string().trim().min(1, 'Start date is required'),
    endDate: z.string().trim().min(1).optional(),
    totalHours: z.number().nonnegative().optional(),
    status: z.enum(RotationStatuses as [string, ...string[]]).optional(),
    remarks: z.string().trim().optional(),
  }),
});

const updateRotationValidationSchema = z.object({
  body: z.object({
    course: objectId.optional(),
    academicDepartment: objectId.optional(),
    academicSemester: objectId.optional(),
    supervisor: objectId.optional(),
    hospital: z.string().trim().min(1).optional(),
    ward: z.string().trim().min(1).optional(),
    startDate: z.string().trim().min(1).optional(),
    endDate: z.string().trim().min(1).optional(),
    totalHours: z.number().nonnegative().optional(),
    status: z.enum(RotationStatuses as [string, ...string[]]).optional(),
    remarks: z.string().trim().optional(),
  }),
});

const createProcedureValidationSchema = z.object({
  body: z.object({
    student: objectId,
    rotation: objectId.optional(),
    course: objectId.optional(),
    procedureCode: z.string().trim().min(1, 'Procedure code is required'),
    procedureName: z.string().trim().min(1, 'Procedure name is required'),
    category: z.enum(ProcedureCategories as [string, ...string[]]),
    competencyLevel: z
      .enum(CompetencyLevels as [string, ...string[]])
      .optional(),
    performedAt: z.string().trim().min(1, 'Performed at is required'),
    ward: z.string().trim().optional(),
    patientEncounterSummary: z.string().trim().optional(),
  }),
});

const updateProcedureValidationSchema = z.object({
  body: z.object({
    procedureName: z.string().trim().min(1).optional(),
    competencyLevel: z
      .enum(CompetencyLevels as [string, ...string[]])
      .optional(),
    performedAt: z.string().trim().min(1).optional(),
    ward: z.string().trim().optional(),
    patientEncounterSummary: z.string().trim().optional(),
  }),
});

const signOffProcedureValidationSchema = z.object({
  body: z.object({
    status: z.enum(
      SignOffStatuses.filter((status) => status !== 'PENDING') as [
        string,
        ...string[],
      ],
      { error: 'Status must be SIGNED_OFF or REJECTED' },
    ),
    supervisor: objectId.optional(),
    remarks: z.string().trim().optional(),
  }),
});

export const ClinicalValidations = {
  createRotationValidationSchema,
  updateRotationValidationSchema,
  createProcedureValidationSchema,
  updateProcedureValidationSchema,
  signOffProcedureValidationSchema,
};
