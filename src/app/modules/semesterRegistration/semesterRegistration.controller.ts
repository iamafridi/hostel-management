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

export const SemesterRegistrationController = {
    createSemesterRegistration,
};
