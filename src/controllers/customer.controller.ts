import { Response, NextFunction } from 'express';
import customerService from '../services/customer.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const getAllCustomers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { search, status, page, limit } = req.query;

    const result = await customerService.getAllCustomers({
      search: search as string,
      status: status as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return sendSuccess(res, 'Customers retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const result = await customerService.getCustomerById(id);
    return sendSuccess(res, 'Customer details retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { isActive, status } = req.body;

    const finalStatus = isActive !== undefined ? Boolean(isActive) : status === 'active';

    const customer = await customerService.updateCustomerStatus(id, finalStatus);
    return sendSuccess(res, `Customer status updated to ${finalStatus ? 'active' : 'inactive'}`, customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomerStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const stats = await customerService.getCustomerStats();
    return sendSuccess(res, 'Customer statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus,
  getCustomerStats,
};
