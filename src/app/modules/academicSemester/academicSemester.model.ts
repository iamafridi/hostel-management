import { model, Schema } from 'mongoose';
import {
    AcademicSemesterCode,
    AcademicSemesterName,
    Months,
} from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
const academicSemesterSchema = new Schema<TAcademicSemester>(
    {
        name: {
            type: String,
            required: true,
            enum: AcademicSemesterName,
        },
        year: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            enum: AcademicSemesterCode,
        },
        startMonth: {
            type: String,
            required: true,
            enum: Months,
        },
        endMonth: {
            type: String,
            required: true,
            enum: Months,
        },
    },
    {
        timestamps: true, // for the createdAt and Updated At
    },
);

//jate same year a same semester bar bar na ashe ejonno pre hook diye eta handle kortesi

academicSemesterSchema.pre('save', async function (next) {
    const isSemesterExist = await AcademicSemester.findOne({
        year: this.year,
        name: this.name //coz this current docs niye kaj kore

    })
    if (isSemesterExist) {
        throw new Error('Semester is already exists!!')
    }
    next();
})

export const AcademicSemester = model<TAcademicSemester>(
    'AcademicSemester',
    academicSemesterSchema,
);
