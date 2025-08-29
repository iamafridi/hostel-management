import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { CourseSearchableFields } from './course.constant';
import { TCourse, TCourseFaculty } from './course.interface';
import { course, courseFaculty } from './course.model';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';

// creating courses into db
const createCourseIntoDB = async (payload: TCourse) => {
    const result = await course.create(payload);
    return result;
};

// Get all the courses
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

// get a single id from db
const getASingleCourseFromDB = async (id: string) => {
    const result = await course
        .findById(id)
        .populate('preRequisiteCourses.course');
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

// update Service
const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
    const { preRequisiteCourses, ...courseRemainingData } = payload;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // step-1: update basic course info
        const updateBasicCourseInfo = await course.findByIdAndUpdate(
            id,
            courseRemainingData,
            {
                new: true,
                runValidators: true,
                session,
            },
        );

        if (!updateBasicCourseInfo) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
        }

        // handle preRequisites
        if (preRequisiteCourses && preRequisiteCourses.length > 0) {
            // deleted pre requisites
            const deletedPreRequisites = preRequisiteCourses
                .filter((el) => el.course && el.isDeleted)
                .map((el) => el.course);

            if (deletedPreRequisites.length > 0) {
                await course.findByIdAndUpdate(
                    id,
                    {
                        $pull: {
                            preRequisiteCourses: { course: { $in: deletedPreRequisites } },
                        },
                    },
                    { new: true, runValidators: true, session },
                );
            }

            // new pre requisites
            const newPreRequisites = preRequisiteCourses.filter(
                (el) => el.course && !el.isDeleted,
            );

            if (newPreRequisites.length > 0) {
                await course.findByIdAndUpdate(
                    id,
                    { $addToSet: { preRequisiteCourses: { $each: newPreRequisites } } },
                    { new: true, runValidators: true, session },
                );
            }
        }

        await session.commitTransaction();
        await session.endSession();

        return course.findById(id).populate('preRequisiteCourses.course');
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
    }
};

// assigning faculties
const assignFacultiesWithCourseIntoDB = async (
    id: string,
    payload: Partial<TCourseFaculty>,
) => {
    const result = await courseFaculty.findByIdAndUpdate(
        id,
        {
            course: id,
            $addToSet: { faculties: { $each: payload.faculties ?? [] } },
        },
        {
            upsert: true,
            new: true,
        },
    );
    return result;
};

export const CourseServices = {
    createCourseIntoDB,
    getAllTheCoursesFromDB,
    getASingleCourseFromDB,
    deleteCourseFromDB,
    updateCourseIntoDB,
    assignFacultiesWithCourseIntoDB,
};
