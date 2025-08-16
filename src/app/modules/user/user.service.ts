import mongoose from 'mongoose';
import config from '../../config';
import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utils';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createStudentIntoDB = async (password: string, payload: TStudent) => {
    // Create a user object
    const userData: Partial<TUser> = {};

    // If password is not given, use the default password
    userData.password = password || (config.default_password as string);

    // Set Student role
    userData.role = 'student';

    // Set manually generated id (commented out)
    // userData.id = '2030100001';

    // Find Academic Semester info, coz amra refer kortesi tai
    const admissionSemester = await AcademicSemester.findById(payload.admissionSemester);


    //Created Session
    const session = await mongoose.startSession()

    try {
        //Starting Session 
        session.startTransaction()

        // Set Generated ID
        userData.id = await generateStudentId(admissionSemester);

        // Create a user model: (Transaction - 1)
        const newUser = await User.create([userData], { session }); //array

        // Create a student
        if (!newUser.length) {

            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user')
        }
        // Set id, _id as user
        payload.id = newUser[0].id; // embedding id
        payload.user = newUser[0]._id; // reference Id


        //Create a Student ( transaction - 2) 
        const newStudent = await Student.create([payload], { session });
        if (!newStudent.length) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Student')
        }

        //committing if it passes all the steps 
        await session.commitTransaction()
        await session.endSession()
        return newStudent;
    }
    catch (err) {
        await session.abortTransaction()
        await session.endSession()

        throw new Error('Failed to create student');
    }
};

export const UserServices = {
    createStudentIntoDB,
};
