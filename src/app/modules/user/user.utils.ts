import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { User } from './user.model';

const findLastStudentId = async () => {
    const lastStudent = await User.findOne(
        {
            role: 'student',
        },
        {
            id: '1',
            _id: 0,
        }
    ).sort({
        createdAt: -1,
    }).lean()

    return lastStudent?.id ? lastStudent.id.substring(6) : undefined
}

//Generating ID Manually
export const generateStudentId = async (payload: TAcademicSemester) => {
    console.log(await findLastStudentId());
    // first time 0000
    let currentId = (0).toString();  //0000 by default  , used let coz eta reassigned hobe

    const lastStudentId = await findLastStudentId()
    const lastStudentSemesterCode = lastStudentId?.substring(4, 6) //01
    const lastStudentYear = lastStudentId?.substring(0, 4) //2030
    //comparision
    const currentSemesterCode = payload.code;
    const currentYear = payload.year;

    if (lastStudentId && lastStudentSemesterCode === currentSemesterCode && lastStudentYear === currentYear) {

        currentId = lastStudentId.substring(6);

    }


    let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');

    incrementId = `${payload.year}${payload.code}${incrementId}`;
    return incrementId;
};