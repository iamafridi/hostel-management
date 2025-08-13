import { TAcademicDepartment } from "./academicDepartment.interface";
import { AcademicDepartment } from "./academicDepartment.model";

const createAcademicDepartmentIntoDB = async (payload: TAcademicDepartment) => {
    // Checking for faculty with same name already exists
    // const existingDepartment = await AcademicDepartment.findOne({
    //     name: payload.name,
    // });

    // if (existingDepartment) {
    //     throw new Error('Department with this name already exists');
    // }

    const result = await AcademicDepartment.create(payload);
    return result;
};

const getAllAcademicDepartmentFromDB = async () => {
    const result = await AcademicDepartment.find();
    return result;
};

const getSingleAcademicDepartmentFromDB = async (id: string) => {
    const result = await AcademicDepartment.findById(id);
    return result;
};

const updateAcademicDepartmentIntoDB = async (
    id: string,
    payload: Partial<TAcademicDepartment>,
) => {
    const result = await AcademicDepartment.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

export const AcademicDepartmentServices = {
    createAcademicDepartmentIntoDB,
    getAllAcademicDepartmentFromDB,
    getSingleAcademicDepartmentFromDB,
    updateAcademicDepartmentIntoDB,
};

// ---> Controller.ts