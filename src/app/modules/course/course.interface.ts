import { Types } from 'mongoose';

export type TPrerequisiteCourses = {
    course: Types.ObjectId;
    isDeleted: boolean;
};


export type TDueCourses = {
    course: Types.ObjectId;
    isDeleted: boolean;
};

export type TCourse = {
    title: string;
    prefix: string;
    credits: number;
    code: number;
    dues: number;
    dueCourses: [TDueCourses];
    preRequisiteCourses: [TPrerequisiteCourses];
    isDeleted?: boolean;
};

export type TCourseFaculty = {
    course: Types.ObjectId;
    faculties: [Types.ObjectId];
};