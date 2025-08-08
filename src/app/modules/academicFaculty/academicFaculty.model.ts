import { model } from "mongoose";
import { TAcademicFaculty } from "./academicFaculty.interface";


const academicFacultySchema = new Schema<TAcademicFaculty>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },

    },
    {
        timestamps: true, // for the createdAt and Updated At
    });


export const AcademicFaculty = model<TAcademicFaculty>('AcademicFaculty', academicFacultySchema);