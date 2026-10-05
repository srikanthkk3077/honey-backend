import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserPayload } from '../types';

const getSecret = (): string => {
  return process.env.JWT_SECRET || 'madhuvan_secret_jwt_key_9837498234_honey_production_key';
};

const getExpiresIn = (): jwt.SignOptions['expiresIn'] => {
  return (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
};

export const generateToken = (payload: IUserPayload, expiresIn?: jwt.SignOptions['expiresIn']): string => {
  const options: SignOptions = {
    expiresIn: expiresIn || getExpiresIn(),
  };

  return jwt.sign(payload, getSecret(), options);
};

export const verifyToken = (token: string): IUserPayload => {
  const primarySecret = getSecret();
  try {
    return jwt.verify(token, primarySecret) as IUserPayload;
  } catch (err) {
    // Fallback: verify against default fallback secret if primary fails
    try {
      return jwt.verify(token, 'madhuvan_secret_jwt_key_default_fallback') as IUserPayload;
    } catch {
      throw err;
    }
  }
};

export default {
  generateToken,
  verifyToken,
};
