import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AcademicFacultyControllers } from './academicFaculty.controller';
import { AcademicFacultyValidation } from './academicFaculty.validation';

const router = express.Router();

// Get all semesters
router.get('/', AcademicFacultyControllers.getAllAcademicFaculties);

// Get single semester by code (e.g., /01, /02, /03)
router.get('/:facultyId', AcademicFacultyControllers.getASingleAcademicFaculty);

// Create new semester
router.post(
    '/create-academic-faculty',
    validateRequest(
        AcademicFacultyValidation.createAcademicFacultyValidationSchema,
    ),
    AcademicFacultyControllers.createAcademicFaculty,
);

//update one by ID
router.patch(
    '/:facultyId',
    validateRequest(
        AcademicFacultyValidation.updateAcademicFacultyValidationSchema,
    ),
    AcademicFacultyControllers.updateAcademicFaculty,
);

export const AcademicFacultyRoutes = router;
