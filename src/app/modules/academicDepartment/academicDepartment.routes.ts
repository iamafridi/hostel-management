import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AcademicDepartmentControllers } from './academicDepartment.controller';
import { AcademicDepartmentValidation } from './academicDepartment.validation';

const router = express.Router();

// Get all Department
router.get('/', AcademicDepartmentControllers.getAllAcademicDepartments);

// Get single Department by code (e.g., /01, /02, /03)
router.get('/:departmentId', AcademicDepartmentControllers.getASingleAcademicDepartment);

// Create new Department
router.post(
    '/create-academic-department',
    validateRequest(
        AcademicDepartmentValidation.createAcademicDepartmentValidationSchema),
    AcademicDepartmentControllers.createAcademicDepartment,
);

//update one by ID
router.patch(
    '/:departmentId',
    validateRequest(
        AcademicDepartmentValidation.updateAcademicDepartmentValidationSchema),
    AcademicDepartmentControllers.updateAcademicDepartment,
);

export const AcademicDepartmentRoutes = router;
