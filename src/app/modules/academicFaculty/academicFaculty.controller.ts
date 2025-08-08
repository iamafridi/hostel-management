import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { AcademicSemesterServices } from './academicSemester.service';
import { AcademicFaculty } from './academicFaculty.model';
import { AcademicFacultyServices } from './academicFaculty.service';

const createAcademicFaculty = catchAsync(async (req, res) => {
    const result = await AcademicFacultyServices.createAcademicFacultyIntoDB(
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Faculty has created Successfully',
        data: result,
    });
});

// Get all academic semesters
const getAllAcademicFaculties = catchAsync(async (req, res) => {
    const result = await AcademicFacultyServices.getAllAcademicFacultiesFromDB;

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Academic Faculties have retrieved successfully',
        data: result,
    });
});

// Get a single semester by code
const getASingleAcademicFaculty = catchAsync(async (req, res) => {
    const { facultyId } = req.params; // Changed from facultyID to code
    const result =
        await AcademicFacultyServices.getSingleAcademicFacultyFromDB(facultyId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Faculty retrieved successfully',
        data: result,
    });
});

// Update one by ID
const updateAcademicFaculty = catchAsync(async (req, res) => {
    const { facultyId } = req.params;
    const result = await AcademicFacultyServices.updateAcademicFacultyIntoDB(
        facultyId,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Faculty is retrieved succesfully',
        data: result,
    });
});

export const AcademicFacultyControllers = {
    createAcademicFaculty,
    getASingleAcademicFaculty,
    getAllAcademicFaculties,
    updateAcademicFaculty,
};
