/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

// eslint-disable-next-line prettier/prettier
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next,
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';

    type TErrorSource = {
        path: string | number;
        message: string;
    }[];

    let errorSources: TErrorSource = [{
        path: '',
        message: 'Something went wrong'

    },
    ];

    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'I am Zod Error';
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        // error: err,
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
