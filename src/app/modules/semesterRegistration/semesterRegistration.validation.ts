import z from "zod"
import { SemesterRegistrationStatus } from "./semesterRegistration.constants"

const createSemesterRegistrationValidationSchema = z.object({
    body: z.object({
        academicSemester: z.string(),
        status: z.enum([...SemesterRegistrationStatus as [string, ...string[]]]),
        startDate: z.iso.datetime(),
        endDate: z.iso.datetime(),
        minCredit: z.number(),
        maxCredit: z.number(),
    })
})


const semesterRegistrationValidations = {
    createSemesterRegistrationValidationSchema,
}