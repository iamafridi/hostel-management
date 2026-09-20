import { Types } from 'mongoose';

export type TRotationStatus =
  | 'PLANNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DISCONTINUED';

// procedures are grouped the way a clinical curriculum mandates them
export type TProcedureCategory =
  | 'CORE_MANDATORY'
  | 'LIFE_SUPPORT_EMERGENCY'
  | 'ELECTIVE';

// a student's progression from simply watching to performing independently
export type TCompetencyLevel =
  | 'OBSERVED'
  | 'ASSISTED'
  | 'PERFORMED_SUPERVISED'
  | 'PERFORMED_INDEPENDENT';

export type TSignOffStatus = 'PENDING' | 'SIGNED_OFF' | 'REJECTED';

export type TClinicalRotation = {
  id: string;
  student: Types.ObjectId;
  course?: Types.ObjectId;
  academicDepartment?: Types.ObjectId;
  academicSemester?: Types.ObjectId;
  supervisor?: Types.ObjectId;
  hospital: string;
  ward: string;
  startDate: Date;
  endDate?: Date;
  totalHours?: number;
  status: TRotationStatus;
  remarks?: string;
  isDeleted?: boolean;
};

export type TSupervisorSignOff = {
  status: TSignOffStatus;
  // the faculty record that supervised the encounter, when one is linked
  supervisor?: Types.ObjectId;
  // the authenticated user that signed the entry off
  signedBy?: string;
  signedAt?: Date;
  remarks?: string;
};

export type TClinicalProcedure = {
  id: string;
  student: Types.ObjectId;
  rotation?: Types.ObjectId;
  course?: Types.ObjectId;
  procedureCode: string;
  procedureName: string;
  category: TProcedureCategory;
  competencyLevel: TCompetencyLevel;
  performedAt: Date;
  ward?: string;
  patientEncounterSummary?: string;
  supervisorSignOff: TSupervisorSignOff;
  isDeleted?: boolean;
};
