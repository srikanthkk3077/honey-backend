import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  error: any = null
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error ? { error } : {}),
  };
  return res.status(statusCode).json(response);
};

export default {
  sendSuccess,
  sendError,
};
