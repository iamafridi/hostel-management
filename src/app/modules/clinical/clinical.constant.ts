import { randomUUID } from 'crypto';
import {
  TCompetencyLevel,
  TProcedureCategory,
  TRotationStatus,
  TSignOffStatus,
} from './clinical.interface';

export const RotationStatuses: TRotationStatus[] = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'DISCONTINUED',
];

export const ProcedureCategories: TProcedureCategory[] = [
  'CORE_MANDATORY',
  'LIFE_SUPPORT_EMERGENCY',
  'ELECTIVE',
];

export const CompetencyLevels: TCompetencyLevel[] = [
  'OBSERVED',
  'ASSISTED',
  'PERFORMED_SUPERVISED',
  'PERFORMED_INDEPENDENT',
];

export const SignOffStatuses: TSignOffStatus[] = [
  'PENDING',
  'SIGNED_OFF',
  'REJECTED',
];

export const ClinicalRotationSearchableFields = [
  'id',
  'hospital',
  'ward',
  'status',
];
export const ClinicalProcedureSearchableFields = [
  'id',
  'procedureCode',
  'procedureName',
  'category',
  'competencyLevel',
];

export const RotationIdPrefix = 'ROT';
export const ProcedureIdPrefix = 'PROC';

export const ClinicalSummaryCacheKey = 'clinical:summary';
export const ClinicalSummaryCacheTtl = 60;

// short, readable, collision resistant identifiers for showcase data
export const generateClinicalId = (prefix: string): string =>
  `${prefix}-${randomUUID().split('-')[0].toUpperCase()}`;
