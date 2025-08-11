import { TAcademicFaculty } from './academicFaculty.interface';
import { AcademicFaculty } from './academicFaculty.model';

const createAcademicFacultyIntoDB = async (payload: TAcademicFaculty) => {
    try {
        console.log('Service: Attempting to create faculty with payload:', payload);

        // Check if faculty with same name already exists
        const existingFaculty = await AcademicFaculty.findOne({
            name: payload.name,
        });
        if (existingFaculty) {
            console.log(
                'Service: Faculty with this name already exists:',
                existingFaculty,
            );
            throw new Error('Faculty with this name already exists');
        }

        console.log('Service: Creating new faculty...');
        const result = await AcademicFaculty.create(payload);
        console.log('Service: Faculty created successfully:', result);

        return result;
    } catch (error) {
        console.error('Service: Error creating faculty:', error);
        throw error;
    }
};

const getAllAcademicFacultiesFromDB = async () => {
    try {
        console.log('Service: Fetching all faculties...');
        const result = await AcademicFaculty.find();
        console.log('Service: Found faculties:', result.length);
        return result;
    } catch (error) {
        console.error('Service: Error fetching faculties:', error);
        throw error;
    }
};

const getSingleAcademicFacultyFromDB = async (id: string) => {
    try {
        console.log('Service: Fetching faculty with ID:', id);
        const result = await AcademicFaculty.findById(id);
        console.log('Service: Found faculty:', result);
        return result;
    } catch (error) {
        console.error('Service: Error fetching single faculty:', error);
        throw error;
    }
};

const updateAcademicFacultyIntoDB = async (
    id: string,
    payload: Partial<TAcademicFaculty>,
) => {
    try {
        console.log('Service: Updating faculty with ID:', id, 'Payload:', payload);
        const result = await AcademicFaculty.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
        });
        console.log('Service: Faculty updated:', result);
        return result;
    } catch (error) {
        console.error('Service: Error updating faculty:', error);
        throw error;
    }
};

export const AcademicFacultyServices = {
    createAcademicFacultyIntoDB,
    getAllAcademicFacultiesFromDB,
    getSingleAcademicFacultyFromDB,
    updateAcademicFacultyIntoDB,
};
