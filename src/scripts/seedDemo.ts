import mongoose from 'mongoose';
import config from '../app/config';
import { DEMO_ACCOUNTS } from '../app/modules/auth/auth.constant';
import { TUser } from '../app/modules/user/user.interface';
import { User } from '../app/modules/user/user.model';
import { Student } from '../app/modules/student/student.model';
import { TFaculty } from '../app/modules/faculty/faculty.interface';
import { Faculty } from '../app/modules/faculty/faculty.model';
import { AcademicFaculty } from '../app/modules/academicFaculty/academicFaculty.model';
import { AcademicDepartment } from '../app/modules/academicDepartment/academicDepartment.model';
import { AcademicSemester } from '../app/modules/academicSemester/academicSemester.model';
import { course } from '../app/modules/course/course.model';
import { Fee } from '../app/modules/fee/fee.model';
import {
  ClinicalProcedure,
  ClinicalRotation,
} from '../app/modules/clinical/clinical.model';
import { generateClinicalId } from '../app/modules/clinical/clinical.constant';

const DEMO_PASSWORD = (config.demo_password as string) || 'Demo@123';

const upsertUser = async (
  email: string,
): Promise<mongoose.HydratedDocument<TUser>> => {
  const account = DEMO_ACCOUNTS.find((item) => item.email === email);

  if (!account) {
    throw new Error(`Unknown demo account: ${email}`);
  }

  const existing = await User.findOne({ email: account.email });

  if (existing) {
    existing.password = DEMO_PASSWORD;
    existing.role = account.role;
    existing.status = 'in-progress';
    existing.isDemo = true;
    existing.isDeleted = false;
    await existing.save();
    return existing;
  }

  return User.create({
    id: account.id,
    email: account.email,
    password: DEMO_PASSWORD,
    role: account.role,
    status: 'in-progress',
    isDemo: true,
    needsPasswordChange: false,
  });
};

const upsertFacultyProfile = async (
  user: mongoose.HydratedDocument<TUser>,
  designation: string,
  academicDepartment: mongoose.Types.ObjectId,
): Promise<mongoose.HydratedDocument<TFaculty>> => {
  const existing = await Faculty.findOne({ user: user._id });

  if (existing) {
    return existing;
  }

  return Faculty.create({
    id: user.id,
    user: user._id,
    designation,
    name: { firstName: 'Demo', middleName: '', lastName: 'Faculty' },
    gender: 'other',
    email: user.email,
    contactNo: '+10000000101',
    emergencyContactNo: '+10000000102',
    presentAddress: 'Clinical Campus',
    permanentAddress: 'Clinical Campus',
    academicDepartment,
  });
};

const main = async () => {
  await mongoose.connect(config.database_url as string, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });

  console.log('[seed] connected to the database');

  // 1. academic scaffolding
  const academicFaculty =
    (await AcademicFaculty.findOne({ name: 'Clinical Sciences' })) ??
    (await AcademicFaculty.create({ name: 'Clinical Sciences' }));

  const academicDepartment =
    (await AcademicDepartment.findOne({ name: 'Cardiology' })) ??
    (await AcademicDepartment.create({
      name: 'Cardiology',
      academicFaculty: academicFaculty._id,
    }));

  const academicSemester =
    (await AcademicSemester.findOne({ year: '2030', name: 'Autumn' })) ??
    (await AcademicSemester.create({
      name: 'Autumn',
      year: '2030',
      code: '01',
      startMonth: 'January',
      endMonth: 'June',
    }));

  // 2. demo login identities
  const users: Record<string, mongoose.HydratedDocument<TUser>> = {};
  for (const account of DEMO_ACCOUNTS) {
    users[account.email] = await upsertUser(account.email);
  }

  // 3. linked student / faculty profiles
  const studentUser = users['demo.student@erp.demo'];
  const facultyUser = users['demo.faculty@erp.demo'];
  const doctorUser = users['demo.doctor@erp.demo'];

  const student =
    (await Student.findOne({ user: studentUser._id })) ??
    (await Student.create({
      id: studentUser.id,
      user: studentUser._id,
      name: { firstName: 'Demo', middleName: '', lastName: 'Student' },
      gender: 'other',
      email: 'demo.student@erp.demo',
      contactNo: '+10000000001',
      emergencyContactNo: '+10000000002',
      presentAddress: 'Clinical Campus',
      permanentAddress: 'Clinical Campus',
      guardian: {
        fatherName: 'Guardian One',
        fatherOccupation: 'N/A',
        fatherContactNo: '+10000000003',
        motherName: 'Guardian Two',
        motherOccupation: 'N/A',
        motherContactNo: '+10000000004',
      },
      localGuardian: {
        name: 'Local Guardian',
        occupation: 'N/A',
        contactNo: '+10000000005',
        address: 'Clinical Campus',
      },
      admissionSemester: academicSemester._id,
      academicDepartment: academicDepartment._id,
    }));

  const facultyProfile = await upsertFacultyProfile(
    facultyUser,
    'Associate Professor',
    academicDepartment._id,
  );
  await upsertFacultyProfile(
    doctorUser,
    'Clinical Supervisor',
    academicDepartment._id,
  );

  // 4. a clinical course plus a rotation and a signed-off procedure
  const clinicalCourse =
    (await course.findOne({ title: 'Clinical Cardiology' })) ??
    (await course.create({
      title: 'Clinical Cardiology',
      prefix: 'CARD',
      code: 601,
      credits: 4,
      dues: 0,
      dueCourses: [],
      preRequisiteCourses: [],
    }));

  const rotation =
    (await ClinicalRotation.findOne({
      student: student._id,
      hospital: 'City Teaching Hospital',
    })) ??
    (await ClinicalRotation.create({
      id: generateClinicalId('ROT'),
      student: student._id,
      course: clinicalCourse._id,
      academicDepartment: academicDepartment._id,
      academicSemester: academicSemester._id,
      supervisor: facultyProfile._id,
      hospital: 'City Teaching Hospital',
      ward: 'Cardiology Ward 3',
      startDate: new Date(),
      totalHours: 0,
      status: 'ACTIVE',
      remarks: 'Sandbox rotation for reviewers.',
    }));

  const existingProcedure = await ClinicalProcedure.findOne({
    student: student._id,
    procedureCode: 'ECG-001',
  });

  if (!existingProcedure) {
    await ClinicalProcedure.create({
      id: generateClinicalId('PROC'),
      student: student._id,
      rotation: rotation._id,
      course: clinicalCourse._id,
      procedureCode: 'ECG-001',
      procedureName: '12-Lead ECG Acquisition',
      category: 'CORE_MANDATORY',
      competencyLevel: 'PERFORMED_SUPERVISED',
      performedAt: new Date(),
      ward: 'Cardiology Ward 3',
      patientEncounterSummary: 'Stable adult, chest pain triage.',
      supervisorSignOff: {
        status: 'SIGNED_OFF',
        supervisor: facultyProfile._id,
        signedBy: String(facultyUser._id),
        signedAt: new Date(),
        remarks: 'Good technique and clean lead placement.',
      },
    });
  }

  // 5. a demo tuition invoice
  const existingFee = await Fee.findOne({
    student: student._id,
    academicSemester: academicSemester._id,
  });

  if (!existingFee) {
    await Fee.create({
      id: 'FEE-DEMO-0001',
      student: student._id,
      academicSemester: academicSemester._id,
      academicDepartment: academicDepartment._id,
      feeHeads: [{ head: 'Tuition', category: 'tuition', amount: 50000 }],
      totalAmount: 50000,
      discount: 0,
      lateFee: 0,
      paidAmount: 0,
      dueAmount: 50000,
      status: 'unpaid',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      remarks: 'Sandbox invoice for reviewers.',
    });
  }

  console.log('[seed] demo data is ready');
  console.log(`[seed] demo password: ${DEMO_PASSWORD}`);
  console.table(
    DEMO_ACCOUNTS.map(({ label, email, role }) => ({ label, email, role })),
  );

  await mongoose.connection.close();
  console.log('[seed] connection closed');
};

main().catch((err: unknown) => {
  console.error('[seed] failed:', (err as Error).message);
  process.exitCode = 1;
  void mongoose.connection.close();
});
