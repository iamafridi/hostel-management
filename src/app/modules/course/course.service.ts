import httpStatus from 'http-Status';
import QueryBuilder from '../../builder/QueryBuilder';
import { CourseSearchableFields } from './course.constant';
import { TCourse } from './course.interface';
import { course } from './course.model';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';

//creating courses into db
const createCourseIntoDB = async (payload: TCourse) => {
    const result = await course.create(payload);
    return result;
};

//Get all the courses
const getAllTheCoursesFromDB = async (query: Record<string, unknown>) => {
    const courseQuery = new QueryBuilder(
        course.find().populate('preRequisiteCourses.course'),
        query,
    )
        .search(CourseSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await courseQuery.modelQuery;
    return result;
};

//get a single id from db
const getASingleCourseFromDB = async (id: string) => {
    const result = await course.findById(id).populate('preRequisiteCourses.course');
    return result;
};

// delete course in db
const deleteCourseFromDB = async (id: string) => {
    const result = await course.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
    );
    return result;
};

//update Service
const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
    const { preRequisiteCourses, ...courseRemainingData } = payload;

    // because we are handling a lot data read and write here so we have to use transaction here 

    const session = await mongoose.startSession()

    try {
        session.startTransaction()

        // step- 1
        const updateBasicCourseInfo = await course.findByIdAndUpdate(id, courseRemainingData, {
            new: true,
            runValidators: true,
            session
        },
        );
        if (!updateBasicCourseInfo) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course')
        }

        //  checking if there is any pre requisite courses to update
        if (preRequisiteCourses && preRequisiteCourses.length > 0) {
            //  filter out the deleted fields 
            const deletedPreRequisites = preRequisiteCourses.filter(el => el.course && el.isDeleted).map((el) => el.course);
            // console.log(deleteCourseFromDB);

            const deletedPreRequisitesCourses = await course.findByIdAndUpdate(id, {
                $pull: {
                    preRequisiteCourses: { course: { $in: deletedPreRequisites } }
                }
            }, {
                new: true,
                runValidators: true, session
            });

            if (!deletedPreRequisitesCourses) {
                throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course')
            }



            // filtering out the new course fields
            const newPreRequisites = preRequisiteCourses?.filter(
                (el) => el.course && !el.isDeleted,
            )
            const newPreRequisitesCourses = await course.findByIdAndUpdate(id, {
                $addToSet: { preRequisiteCourses: { $each: newPreRequisites } }
            }, {
                new: true,
                runValidators: true, session
            })

            if (!newPreRequisites) {
                throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course')
            }
            const result = await course.findById(id).populate('preRequisiteCourses.course')


            return result;

        }
        await session.commitTransaction();
        await session.endSession();
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course')
    }


}

export const CourseServices = {
    createCourseIntoDB,
    getAllTheCoursesFromDB,
    getASingleCourseFromDB,
    deleteCourseFromDB,
    updateCourseIntoDB
};
