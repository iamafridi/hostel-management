import { Types } from "mongoose";

export type TPrerequisiteCourses = {
    course: Types.ObjectId;
    isDeleted: boolean;
}

export type TCourse = {
    title: string;
    prefix: string;
    credits: Number;
    code: Number;
    dues: Number;
    preRequisiteCourses: [TPrerequisiteCourses],
    isDeleted?: boolean;
}