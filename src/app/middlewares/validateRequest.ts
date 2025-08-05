import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            //validation check
            // if everything is okay then next () ->controller
            await schema.parseAsync({
                body: req.body,
            });

            next();
        } catch (err) {
            next(err);
        }
    };
};

export default validateRequest;