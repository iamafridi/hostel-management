import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SemesterRegistrationService } from './semesterRegistration.service';
import httpStatus from 'http-status';

const createSemesterRegistration = catchAsync(async (req, res) => {
    const result =
        await SemesterRegistrationService.createSemesterRegistrationIntoDB(
            req.body,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Semester Registraion is created successfully !',
        data: result,
    });
});

const getAllSemesterRegistrations = catchAsync(async (req, res) => {
    const result =
        await SemesterRegistrationService.getAllSemesterRegistrationsFromDB(
            req.query,
        );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All the Semester Registration is retrived successfully',
        data: result,
    });
});

const getSingleSemesterRegistration = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await SemesterRegistrationService.getSingleSemesterRegistrationsFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Semester Registration is retrived successfully',
        data: result,
    });
});

export const SemesterRegistrationController = {
    createSemesterRegistration,
    getAllSemesterRegistrations,
    getSingleSemesterRegistration
};
