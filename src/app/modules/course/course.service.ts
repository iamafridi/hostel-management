import { TCourse } from "./course.interface";
import { course } from "./course.model"

//creating courses into db
const createCourseIntoDB = async (payload: TCourse) => {
    const result = await course.create(payload);
    return result;
}

//Get all the courses 
const getAllTheCoursesFromDB = async () => {
    const result = await course.find();
    return result;
}

//get a single id from db 
const getASingleCourseFromDB = async (id: string) => {
    const result = await course.findById(id);
    return result;
}

// delete course in db 
const deleteCourseFromDB = async (id: string) => {
    const result = await course.findByIdAndUpdate(id, { isDeleted: true }, { new: true, })
    return result;
}

export const CourseServices = {
    createCourseIntoDB,
    getAllTheCoursesFromDB, getASingleCourseFromDB, deleteCourseFromDB
}