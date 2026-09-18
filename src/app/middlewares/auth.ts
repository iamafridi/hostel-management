import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { TUserRole } from '../modules/user/user.interface';
import { extractBearerToken, verifyAccessToken } from '../utils/jwt';

export const DEMO_FORBIDDEN_MESSAGE =
  'Demo accounts are view-only. You cannot modify sandbox data.';

// http verbs that change state, used by the demo guard
export const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// decodes the bearer token when one is present but never rejects the request, so
// public routes keep working while authenticated ones get the caller attached
export const attachUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractBearerToken(req.headers.authorization);

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      req.user = undefined;
    }
  }

  next();
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(
      new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not authorized to access this resource',
      ),
    );
  }

  next();
};

// role based access control : the caller may only proceed with one of the listed roles
export const requireRole =
  (...roles: TUserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError(
          httpStatus.UNAUTHORIZED,
          'You are not authorized to access this resource',
        ),
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          httpStatus.FORBIDDEN,
          'You do not have permission to perform this action',
        ),
      );
    }

    next();
  };
