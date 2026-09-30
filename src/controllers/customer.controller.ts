import { Response, NextFunction } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const getAllCustomers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;

    const query: any = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 'Customers retrieved successfully', {
      customers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;

    const customer = await User.findById(id).select('-password');
    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    const orders = await Order.find({ user: id }).sort('-createdAt').limit(10);
    const orderCount = await Order.countDocuments({ user: id });

    return sendSuccess(res, 'Customer details retrieved successfully', {
      customer,
      totalOrders: orderCount,
      recentOrders: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return sendError(res, 'isActive boolean status is required', 400);
    }

    const customer = await User.findByIdAndUpdate(
      id,
      { isActive: Boolean(isActive) },
      { new: true }
    ).select('-password');

    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }

    return sendSuccess(res, `Customer status updated to ${isActive ? 'active' : 'inactive'}`, customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomerStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const [totalCustomers, activeCustomers, startOfMonth] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', isActive: true }),
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ]);

    const newCustomersThisMonth = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfMonth },
    });

    return sendSuccess(res, 'Customer statistics retrieved successfully', {
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
    });
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
