import AppError from '../../errors/AppError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TSemesterRegistration } from './semesterRegistration.interface';
import httpStatus from 'http-status';
import { SemesterRegistration } from './semesterRegistration.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createSemesterRegistrationIntoDB = async (
    payload: TSemesterRegistration,
) => {
    const academicSemester = payload?.academicSemester;
    // Checking if the semester exist ?
    const isAcademicSemesterExists =
        await AcademicSemester.findById(academicSemester);

    if (!isAcademicSemesterExists) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            'The academic semester not found !',
        );
    }
    // Checking if the semester is already exists or not?
    const isSemesterRegistrationExists = await SemesterRegistration.findOne({
        academicSemester,
    });
    if (isSemesterRegistrationExists) {
        throw new AppError(
            httpStatus.CONFLICT,
            'The academic semester already exists !',
        );
    }

    const result = await SemesterRegistration.create(payload);
    return result;
};
const getAllSemesterRegistrationsFromDB = async (
    query: Record<string, unknown>,
) => {
    const semesterRegistrationQuery = new QueryBuilder(
        SemesterRegistration.find().populate('academicSemester'), query
    ).filter().sort().paginate().fields();

    const result = await semesterRegistrationQuery.modelQuery
    return result;


};
const getSingleSemesterRegistrationsFromDB = async () => { };
const updateSemesterRegistrationsIntoFromDB = async () => { };

export const SemesterRegistrationService = {
    createSemesterRegistrationIntoDB,
    getAllSemesterRegistrationsFromDB,
    getSingleSemesterRegistrationsFromDB,
    updateSemesterRegistrationsIntoFromDB,
};
