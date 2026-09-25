import { getCached, setCache } from '../../utils/redis';
import { AuditLog } from '../auditLog/auditLog.model';
import {
  ClinicalProcedure,
  ClinicalRotation,
} from '../clinical/clinical.model';
import { course } from '../course/course.model';
import { Faculty } from '../faculty/faculty.model';
import { Fee } from '../fee/fee.model';
import { Notification } from '../notification/notification.model';
import { Payment } from '../payment/payment.model';
import { Student } from '../student/student.model';
import { User } from '../user/user.model';

const DashboardOverviewCacheKey = 'dashboard:overview';
const DashboardOverviewCacheTtl = 60;

// high level institutional counters, everything is read in parallel and cached briefly
const getOverviewFromDB = async () => {
  const cachedOverview = await getCached<Record<string, unknown>>(
    DashboardOverviewCacheKey,
  );
  if (cachedOverview) {
    return cachedOverview;
  }

  const [
    totalStudents,
    totalFaculty,
    totalCourses,
    usersByRole,
    feeTotals,
    activeRotations,
    totalProcedures,
    pendingSignOff,
    unreadNotifications,
  ] = await Promise.all([
    Student.countDocuments(),
    Faculty.countDocuments(),
    course.countDocuments(),
    User.aggregate([
      { $group: { _id: '$role', total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Fee.aggregate([
      {
        $group: {
          _id: null,
          invoices: { $sum: 1 },
          billed: { $sum: '$totalAmount' },
          collected: { $sum: '$paidAmount' },
          outstanding: { $sum: '$dueAmount' },
          discounts: { $sum: '$discount' },
        },
      },
      { $project: { _id: 0 } },
    ]),
    ClinicalRotation.countDocuments({ status: 'ACTIVE' }),
    ClinicalProcedure.countDocuments(),
    ClinicalProcedure.countDocuments({ 'supervisorSignOff.status': 'PENDING' }),
    Notification.countDocuments({ isRead: false }),
  ]);

  const fees = (feeTotals[0] as Record<string, number> | undefined) ?? {
    invoices: 0,
    billed: 0,
    collected: 0,
    outstanding: 0,
    discounts: 0,
  };

  const overview = {
    academics: { totalStudents, totalFaculty, totalCourses },
    fees: {
      invoices: fees.invoices,
      billed: fees.billed,
      collected: fees.collected,
      outstanding: fees.outstanding,
      discounts: fees.discounts,
      collectionRate:
        fees.billed > 0
          ? Number(((fees.collected / fees.billed) * 100).toFixed(2))
          : 0,
    },
    clinical: { activeRotations, totalProcedures, pendingSignOff },
    engagement: { unreadNotifications },
    usersByRole,
    generatedAt: new Date().toISOString(),
  };

  await setCache(
    DashboardOverviewCacheKey,
    overview,
    DashboardOverviewCacheTtl,
  );

  return overview;
};

// the feeds a reviewer sees first : audit trail, payments, admissions and clinical activity
const getRecentActivityFromDB = async () => {
  const [recentAuditLogs, recentPayments, recentAdmissions, recentProcedures] =
    await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('module action method path statusCode actor.email createdAt')
        .lean(),
      Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('student', 'id name email')
        .select('id receiptNumber amount method status paymentDate createdAt')
        .lean(),
      Student.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('id name email admissionSemester academicDepartment createdAt')
        .lean(),
      ClinicalProcedure.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('student', 'id name')
        .select(
          'id procedureCode procedureName category competencyLevel supervisorSignOff.status createdAt',
        )
        .lean(),
    ]);

  return {
    recentAuditLogs,
    recentPayments,
    recentAdmissions,
    recentProcedures,
  };
};

export const DashboardServices = {
  getOverviewFromDB,
  getRecentActivityFromDB,
};
