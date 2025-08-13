import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { AcademicDepartmentServices } from './academicDepartment.service';

const createAcademicDepartment = catchAsync(async (req, res) => {
    // console.log('Request received:', req.body);

    const result = await AcademicDepartmentServices.createAcademicDepartmentIntoDB(
        req.body,
    );

    // console.log('Result from DB:', result); 

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Department has created Successfully',
        data: result,
    });
});
// Get all academic Department
const getAllAcademicDepartments = catchAsync(async (req, res) => {
    const result = await AcademicDepartmentServices.getAllAcademicDepartmentFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Academic Department have retrieved successfully',
        data: result,
    });
});

// Get a single Department by code
const getASingleAcademicDepartment = catchAsync(async (req, res) => {
    const { departmentId } = req.params;
    const result =
        await AcademicDepartmentServices.getSingleAcademicDepartmentFromDB(departmentId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Department retrieved successfully',
        data: result,
    });
});

// Update one by ID
const updateAcademicDepartment = catchAsync(async (req, res) => {
    const { departmentId } = req.params;
    const result = await AcademicDepartmentServices.updateAcademicDepartmentIntoDB(
        departmentId,
        req.body,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Department is updated successfully',
        data: result,
    });
});

export const AcademicDepartmentControllers = {
    createAcademicDepartment,
    getASingleAcademicDepartment,
    getAllAcademicDepartments,
    updateAcademicDepartment,
};

//--->routes.ts