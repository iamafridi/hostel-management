import express from 'express';
import { AcademicSemesterControllers } from './academicSemester.controller';
import validateRequest from '../../middlewares/validateRequest';
import { academicSemesterValidations } from './academicSemester.validation';

const router = express.Router();

// Get all semesters
router.get('/', AcademicSemesterControllers.getAllAcademicSemester);

// Get single semester by code (e.g., /01, /02, /03)
router.get('/:code', AcademicSemesterControllers.getASingleAcademicSemester);

// Create new semester
router.post(
    '/create-academic-semester',
    validateRequest(
        academicSemesterValidations.createAcademicSemesterValidationSchema,
    ),
    AcademicSemesterControllers.createAcademicSemester,
);

//update one by ID
router.patch(
    '/:semesterId',
    validateRequest(
        academicSemesterValidations.updateAcademicSemesterValidationSchema,
    ),
    AcademicSemesterControllers.updateAcademicSemester,
);

export const AcademicRoutes = router;
