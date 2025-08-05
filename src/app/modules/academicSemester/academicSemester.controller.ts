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

export const AcademicSemesterControllers = {
    createAcademicSemester,
};
