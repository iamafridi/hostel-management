import { model, Schema } from 'mongoose';
import { TAcademicSemester, TMonth } from './academicSemester.interface';

export const months: TMonths[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const academicSemesterSchema = new Schema<TAcademicSemester>(
    {
        name: {
            type: String,
            required: true,
        },
        year: {
            type: Date,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        startMonth: {
            type: String,
            enum: months,
        },
        endMonth: {
            type: String,
            enum: months,
        },
    },
    {
        timestamps: true, // for the createdAt and Updated At
    },
);


export const AcademicSemester = model<TAcademicSemester>('AcademicSemester', academicSemesterSchema)
