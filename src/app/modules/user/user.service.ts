import config from '../../config';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
    // create a user object
    const userData: Partial<TUser> = {};

    // if password is not given , use the default password

    userData.password = password || (config.default_password as string);

    // Set Student role
    userData.role = 'student';

    //set manually generated id 
    userData.id = '2030100001'

    // create a user model
    const newUser = await User.create(userData);

    // Create a student
    if (Object.keys(result).length) {
        // set id, _id as user 
        studentData.id = result.id;// embedding id
        studentData.user = result._id; //reference Id 

        const newStudent = await Student.creat(studentData);
        return newStudent;


    }
};

export const UserServices = {
    createStudentIntoDB,
};
