import { model, Schema } from 'mongoose';
import { TAcademicFaculty } from './academicFaculty.interface';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const academicFacultySchema = new Schema<TAcademicFaculty>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true, // for the createdAt and Updated At
    },
);

// Checking for faculty with same name already exists, if it does then it will thorw and error
academicFacultySchema.pre('save', async function (next) {
    //AcademicFaculty er jaigai :-------->>>> this.model! JS e
    const existingFaculty = await AcademicFaculty.findOne({
        name: this.name,
    });

    if (existingFaculty) {
        throw new AppError('Faculty with this name already exists');
    }

    next();
});

// for update
academicFacultySchema.pre('findOneAndUpdate', async function (next) {
    const query = this.getQuery();
    // console.log(query);
    const isFacultyExist = await AcademicFaculty.findOne(query);
    if (!isFacultyExist) {
        throw new AppError(httpStatus.NOT_FOUND, 'This Faculty does not exist !');
    }
    next();
});

export const AcademicFaculty = model<TAcademicFaculty>(
    'AcademicFaculty',
    academicFacultySchema,
);
