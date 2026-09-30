import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'madhuvan_secret_jwt_key_default_fallback';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

export const generateToken = (payload: IUserPayload, expiresIn?: jwt.SignOptions['expiresIn']): string => {
  const options: SignOptions = {
    expiresIn: expiresIn || JWT_EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): IUserPayload => {
  return jwt.verify(token, JWT_SECRET) as IUserPayload;
};

export default {
  generateToken,
  verifyToken,
};
