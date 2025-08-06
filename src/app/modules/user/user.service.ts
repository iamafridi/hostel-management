import config from '../../config';
import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateStudentId } from './user.utils';

const createStudentIntoDB = async (password: string, payload: TStudent) => {
    // create a user object
    const userData: Partial<TUser> = {};

    // if password is not given , use the default password

    userData.password = password || (config.default_password as string);

    // Set Student role
    userData.role = 'student';

    //set manually generated id
    // userData.id = '2030100001';

    // Find Academic Semester info , coz amra reffer kortesi tai
    const admissionSemester = await AcademicSemester.findById(payload.admissionSemester)

    //Set Generated ID
    userData.id = generateStudentId(admissionSemester);

    // create a user model
    const newUser = await User.create(userData);

    // Create a student
    if (Object.keys(newUser).length) {
        // set id, _id as user
        payload.id = newUser.id; // embedding id
        payload.user = newUser._id; //reference Id

        const newStudent = await Student.create(payload);
        return newStudent;
    }
};

export const UserServices = {
    createStudentIntoDB,
};
