import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';

const createStudent = catchAsync(async (req, res) => {
    // console.log('req.body:', req.body);

    const { password, student: studentData } = req.body;
    // const zodParsedData = studentValidationSchema.parse(studentData);

    const result = await UserServices.createStudentIntoDB(password, studentData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Student has created Successfully',
        data: result,
    });
});

export const UserControllers = {
    createStudent,
};
