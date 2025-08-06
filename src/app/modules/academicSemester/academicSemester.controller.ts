import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { AcademicSemesterServices } from './academicSemester.service';

const createAcademicSemester = catchAsync(async (req, res) => {
    const result = await AcademicSemesterServices.createAcademicSemesterIntoDB(
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Semester has created Successfully',
        data: result,
    });
});

// Get all academic semesters
const getAllAcademicSemester = catchAsync(async (req, res) => {
    const result = await AcademicSemesterServices.getAllAcademicSemestersFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Academic Semesters retrieved successfully',
        data: result,
    });
});

// Get a single semester by code
const getASingleAcademicSemester = catchAsync(async (req, res) => {
    const { code } = req.params; // Changed from semesterId to code
    const result = await AcademicSemesterServices.getASingleAcademicSemesterFromDB(code);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Semester retrieved successfully',
        data: result,
    });
});

// Update one by ID
const updateAcademicSemester = catchAsync(async (req, res) => {
    const { semesterId } = req.params;
    const result = await AcademicSemesterServices.updateAcademicSemesterIntoDB(
        semesterId,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic semester is retrieved succesfully',
        data: result,
    });
});

export const AcademicSemesterControllers = {
    createAcademicSemester,
    getAllAcademicSemester,
    getASingleAcademicSemester,
    updateAcademicSemester,
};