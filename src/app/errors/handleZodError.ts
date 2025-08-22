import z, { ZodError } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handleZodError = (err: ZodError): TGenericErrorResponse => {
    const errorSources: TErrorSources = err.issues.map((issue: z.core.$ZodIssue) => {
        return {
            path: issue?.path[issue.path.length - 1],
            message: issue.message,
        };
    });

    const statusCode = 400;

    return {
        statusCode,
        message: 'Validation Error',
        errorSources,
    };
};


export default handleZodError;