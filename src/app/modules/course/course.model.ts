import { model, Schema } from 'mongoose';
import {
    TCourse,
    TCourseFaculty,
    TPrerequisiteCourses,
    TDueCourses,
} from './course.interface';

const preRequisiteCoursesSchema = new Schema<TPrerequisiteCourses>({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
    },
});

const dueCoursesSchema = new Schema<TDueCourses>({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
    },
});

const courseSchema = new Schema<TCourse>({
    title: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },

    prefix: {
        type: String,
        trim: true,
        required: true,
    },
    code: {
        type: Number,
        trim: true,
        required: true,
    },

    credits: {
        type: Number,
        trim: true,
        required: true,
    },
    dues: {
        type: Number,
    },
    dueCourses: [dueCoursesSchema],
    preRequisiteCourses: [preRequisiteCoursesSchema],
    isDeleted: {
        type: Boolean,
        default: false,
    },
});

//Model creation
export const course = model<TCourse>('Course', courseSchema);

const courseFacultySchema = new Schema<TCourseFaculty>({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        unique: true,
    },

    faculties: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Faculty',
        },
    ],
});

export const courseFaculty = model<TCourseFaculty>(
    'CourseFaculty',
    courseFacultySchema,
);