import { Types } from "mongoose";

export type TPrerequisiteCourses = {
    course: Types.ObjectId;
    isDeleted: boolean;
}

export type TCourse = {
    title: string;
    prefix: string;
    credits: string;
    code: string;
    dues: Number;
    preRequisiteCourses: []
}