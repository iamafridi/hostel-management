import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { DEMO_FORBIDDEN_MESSAGE, MUTATION_METHODS } from './auth';

// sandbox reviewers get full read access, but the shared demo data must stay intact
const demoGuard = (req: Request, _res: Response, next: NextFunction) => {
  const isMutation = MUTATION_METHODS.includes(req.method);

  if (req.user?.isDemo && isMutation) {
    return next(new AppError(httpStatus.FORBIDDEN, DEMO_FORBIDDEN_MESSAGE));
  }

  next();
};

export default demoGuard;
