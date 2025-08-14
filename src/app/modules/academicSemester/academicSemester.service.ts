import AppError from "../../errors/AppError";
import { academicSemesterNameCodeMapper } from "./academicSemester.constant";
import { TAcademicSemester } from "./academicSemester.interface";
import { AcademicSemester } from "./academicSemester.model";
import httpStatus from 'http-status';

const createAcademicSemesterIntoDB = async (payload: TAcademicSemester) => {
    // Validate semester name-code mapping
    if (academicSemesterNameCodeMapper[payload.name] !== payload.code) {
        throw new Error('Invalid Semester Code');
    }

    const result = await AcademicSemester.create(payload);
    return result;
}

// Get all academic semesters
const getAllAcademicSemestersFromDB = async () => {
    const result = await AcademicSemester.find();
    return result;
}

// Get a single academic semester by code
const getASingleAcademicSemesterFromDB = async (code: string) => {
    const result = await AcademicSemester.findOne({ code });

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Academic Semester not found');
    }

    return result;
}

// Updating
const updateAcademicSemesterIntoDB = async (
    id: string,
    payload: Partial<TAcademicSemester>,
) => {
    if (
        payload.name &&
        payload.code &&
        academicSemesterNameCodeMapper[payload.name] !== payload.code
    ) {
        throw new Error('Invalid Semester Code');
    }

    const result = await AcademicSemester.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return result;
};



export const AcademicSemesterServices = {
    createAcademicSemesterIntoDB,
    getAllAcademicSemestersFromDB,
    getASingleAcademicSemesterFromDB,
    updateAcademicSemesterIntoDB,
}