import { model, Schema } from "mongoose";
import { TAcademicDepartment } from "./academicDepartment.interface";

const academicDepartmentSchema = new Schema<TAcademicDepartment>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        academicFaculty: {
            type: Schema.Types.ObjectId,
            ref: "AcademicFaculty",
        },
    },
    {
        timestamps: true,
    }
);

// Checking for faculty with same name already exists, if it does then it will thorw and error 
academicDepartmentSchema.pre('save', async function (next) {
    //AcademicDepartment er jaigai :-------->>>> this.model! JS e
    const existingDepartment = await AcademicDepartment.findOne({
        name: this.name,
    });

    if (existingDepartment) {
        throw new Error('Department with this name already exists');
    }

    next();
});

// for update 
academicDepartmentSchema.pre('findOneAndUpdate', async function (next) {
    const query = this.getQuery();
    // console.log(query);
    const isDepartmetentExist = await AcademicDepartment.findOne(query);
    if (!isDepartmetentExist) {
        throw new Error("This department does not exist !");
    }
    next();
});



export const AcademicDepartment = model<TAcademicDepartment>(
    "AcademicDepartment",
    academicDepartmentSchema
);

//now ---> validation.