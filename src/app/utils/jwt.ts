import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import { TUserRole } from '../modules/user/user.interface';

// the claims carried by every access / refresh token issued by the platform
export type TJwtPayload = {
  userId: string;
  id: string;
  email?: string;
  role: TUserRole;
  isDemo: boolean;
};

const signToken = (
  payload: TJwtPayload,
  secret: string,
  expiresIn: string,
): string =>
  jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);

const verifyToken = (token: string, secret: string): TJwtPayload => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload & TJwtPayload;

    return {
      userId: decoded.userId,
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as TUserRole,
      isDemo: Boolean(decoded.isDemo),
    };
  } catch {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'The token is invalid or has expired',
    );
  }
};

// a missing secret is a configuration error, not something a caller can recover from
const requireSecret = (secret: string | undefined, name: string): string => {
  if (!secret) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `${name} is not configured`,
    );
  }

  return secret;
};

export const createAccessToken = (payload: TJwtPayload): string =>
  signToken(
    payload,
    requireSecret(config.jwt_access_secret, 'JWT_ACCESS_SECRET'),
    config.jwt_access_expires_in as string,
  );

export const createRefreshToken = (payload: TJwtPayload): string =>
  signToken(
    payload,
    requireSecret(config.jwt_refresh_secret, 'JWT_REFRESH_SECRET'),
    config.jwt_refresh_expires_in as string,
  );

export const verifyAccessToken = (token: string): TJwtPayload =>
  verifyToken(
    token,
    requireSecret(config.jwt_access_secret, 'JWT_ACCESS_SECRET'),
  );

export const verifyRefreshToken = (token: string): TJwtPayload =>
  verifyToken(
    token,
    requireSecret(config.jwt_refresh_secret, 'JWT_REFRESH_SECRET'),
  );

// extracts the bearer token from an authorization header
export const extractBearerToken = (
  authorization?: string,
): string | undefined => {
  if (!authorization) return undefined;

  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;

  return token;
};
