/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import z, { ZodError, ZodIssue } from 'zod';
import { issue } from 'zod/v4/core/util.cjs';
import { TErrorSource } from '../interface/error';
import config from '../config';

// eslint-disable-next-line prettier/prettier
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next,
) => {
    const statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';

    const errorSources: TErrorSource = [
        {
            path: '',
            message: 'Something went wrong',
        },
    ];

    const handleZodError = (err: ZodError) => {
        const errorSources: TErrorSource = err.issues.map((issue: z.core.$ZodIssue) => {
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

    if (err instanceof ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    }
    //Ultimate retuning from here
    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        stack: config.NODE_ENV === 'development' ? err?.stack : null
    });
};

export default globalErrorHandler;

// Pattern
/*
success
message 
errorSources: [
path: '',
message:''
]

stack
*/
