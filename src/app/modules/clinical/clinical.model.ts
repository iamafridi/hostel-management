import { Model, Schema, model, models } from 'mongoose';
import {
  CompetencyLevels,
  ProcedureCategories,
  RotationStatuses,
  SignOffStatuses,
} from './clinical.constant';
import {
  TClinicalProcedure,
  TClinicalRotation,
  TSupervisorSignOff,
} from './clinical.interface';

const clinicalRotationSchema = new Schema<TClinicalRotation>(
  {
    id: {
      type: String,
      required: [true, 'ID is required'],
      unique: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      required: [true, 'Student is required'],
      ref: 'Student',
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    academicDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicDepartment',
    },
    academicSemester: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicSemester',
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true,
    },
    ward: {
      type: String,
      required: [true, 'Ward is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    totalHours: {
      type: Number,
      min: [0, 'Total hours can not be negative'],
    },
    status: {
      type: String,
      enum: {
        values: RotationStatuses,
        message: '{VALUE} is not a valid rotation status',
      },
      default: 'PLANNED',
    },
    remarks: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

clinicalRotationSchema.index({ status: 1, startDate: -1 });
clinicalRotationSchema.index({ student: 1, status: 1 });

const supervisorSignOffSchema = new Schema<TSupervisorSignOff>(
  {
    status: {
      type: String,
      enum: {
        values: SignOffStatuses,
        message: '{VALUE} is not a valid sign-off status',
      },
      default: 'PENDING',
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    signedBy: { type: String, trim: true },
    signedAt: { type: Date },
    remarks: { type: String, trim: true },
  },
  { _id: false },
);

const clinicalProcedureSchema = new Schema<TClinicalProcedure>(
  {
    id: {
      type: String,
      required: [true, 'ID is required'],
      unique: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      required: [true, 'Student is required'],
      ref: 'Student',
      index: true,
    },
    rotation: {
      type: Schema.Types.ObjectId,
      ref: 'ClinicalRotation',
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    procedureCode: {
      type: String,
      required: [true, 'Procedure code is required'],
      trim: true,
      uppercase: true,
    },
    procedureName: {
      type: String,
      required: [true, 'Procedure name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ProcedureCategories,
        message: '{VALUE} is not a valid procedure category',
      },
      required: [true, 'Procedure category is required'],
    },
    competencyLevel: {
      type: String,
      enum: {
        values: CompetencyLevels,
        message: '{VALUE} is not a valid competency level',
      },
      default: 'OBSERVED',
    },
    performedAt: {
      type: Date,
      required: [true, 'Performed at is required'],
    },
    ward: { type: String, trim: true },
    patientEncounterSummary: { type: String, trim: true },
    supervisorSignOff: {
      type: supervisorSignOffSchema,
      default: () => ({ status: 'PENDING' }),
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

clinicalProcedureSchema.index({ student: 1, category: 1 });
clinicalProcedureSchema.index({ rotation: 1, performedAt: -1 });
clinicalProcedureSchema.index({ 'supervisorSignOff.status': 1 });

// soft delete filters shared by both clinical collections
clinicalRotationSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

clinicalRotationSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

clinicalRotationSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

clinicalProcedureSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

clinicalProcedureSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

clinicalProcedureSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const ClinicalRotation: Model<TClinicalRotation> =
  (models.ClinicalRotation as Model<TClinicalRotation>) ||
  model<TClinicalRotation>('ClinicalRotation', clinicalRotationSchema);

export const ClinicalProcedure: Model<TClinicalProcedure> =
  (models.ClinicalProcedure as Model<TClinicalProcedure>) ||
  model<TClinicalProcedure>('ClinicalProcedure', clinicalProcedureSchema);
