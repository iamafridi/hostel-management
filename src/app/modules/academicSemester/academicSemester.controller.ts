import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { AcademicFacultyServices } from '../academicFaculty/academicFaculty.service';

const createAcademicFaculty = catchAsync(async (req, res) => {
    console.log('Controller: Request received');
    console.log('Controller: Headers:', req.headers);
    console.log('Controller: Body:', req.body);
    console.log('Controller: Content-Type:', req.get('Content-Type'));

    // Validate that body exists and has required fields
    if (!req.body) {
        console.log('Controller: No request body found');
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Request body is missing',
            data: null,
        });
    }

    if (!req.body.name || req.body.name.trim() === '') {
        console.log('Controller: Faculty name is missing or empty');
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Faculty name is required',
            data: null,
        });
    }

    try {
        console.log('Controller: Calling service with:', req.body);
        const result = await AcademicFacultyServices.createAcademicFacultyIntoDB(
            req.body,
        );
        console.log('Controller: Service returned:', result);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: 'Academic Faculty has been created successfully',
            data: result,
        });
    } catch (error) {
        console.error('Controller: Error occurred:', error);

        // Handle duplicate key error (E11000)
        if (error.code === 11000) {
            return sendResponse(res, {
                statusCode: httpStatus.CONFLICT,
                success: false,
                message: 'Faculty with this name already exists',
                data: null,
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'Validation failed',
                data: error.errors,
            });
        }

        throw error; // Let catchAsync handle other errors
    }
});

// Get all academic faculty
const getAllAcademicFaculties = catchAsync(async (req, res) => {
    console.log('Controller: Getting all faculties');
    const result = await AcademicFacultyServices.getAllAcademicFacultiesFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Academic Faculties retrieved successfully',
        data: result,
    });
});

// Get a single faculty by ID
const getASingleAcademicFaculty = catchAsync(async (req, res) => {
    console.log(
        'Controller: Getting single faculty with ID:',
        req.params.facultyId,
    );
    const { facultyId } = req.params;

    if (!facultyId) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Faculty ID is required',
            data: null,
        });
    }

    const result =
        await AcademicFacultyServices.getSingleAcademicFacultyFromDB(facultyId);

    if (!result) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'Academic Faculty not found',
            data: null,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Faculty retrieved successfully',
        data: result,
    });
});

// Update one by ID
const updateAcademicFaculty = catchAsync(async (req, res) => {
    console.log('Controller: Updating faculty with ID:', req.params.facultyId);
    console.log('Controller: Update data:', req.body);

    const { facultyId } = req.params;

    if (!facultyId) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Faculty ID is required',
            data: null,
        });
    }

    const result = await AcademicFacultyServices.updateAcademicFacultyIntoDB(
        facultyId,
        req.body,
    );

    if (!result) {
        return sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'Academic Faculty not found',
            data: null,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Academic Faculty updated successfully',
        data: result,
    });
});

export const AcademicFacultyControllers = {
    createAcademicFaculty,
    getASingleAcademicFaculty,
    getAllAcademicFaculties,
    updateAcademicFaculty,
};
