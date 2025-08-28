import { model, Schema } from 'mongoose';
import { TCourse, TPrerequisiteCourses } from './course.interface';

const preRequisiteCoursesSchema = new Schema<TPrerequisiteCourses>({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})


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
    preRequisiteCourses: [preRequisiteCoursesSchema],

});


//Model creation 
export const course = model<TCourse>('Course', courseSchema)