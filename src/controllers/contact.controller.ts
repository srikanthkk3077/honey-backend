import { Request, Response, NextFunction } from 'express';
import contactService from '../services/contact.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const submitContact = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return sendError(res, 'Name, email, and message are required', 400);
    }

    const inquiry = await contactService.submitInquiry(req.body);
    return sendSuccess(res, 'Thank you! Your message has been received. Our apiary team will respond shortly.', inquiry, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllInquiries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { status } = req.query;
    const inquiries = await contactService.getAllInquiries(status as string);
    return sendSuccess(res, 'Inquiries retrieved successfully', inquiries);
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!status) {
      return sendError(res, 'Status is required', 400);
    }

    const updated = await contactService.updateInquiryStatus(id, status);
    return sendSuccess(res, 'Inquiry status updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const subscribeNewsletter = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Email address is required', 400);
    }

    const subscriber = await contactService.subscribeNewsletter(email);
    return sendSuccess(res, 'Welcome to the Madhuvan Apiary Community! You have successfully subscribed.', subscriber, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllSubscribers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const subscribers = await contactService.getAllSubscribers();
    return sendSuccess(res, 'Newsletter subscribers retrieved successfully', subscribers);
  } catch (error) {
    next(error);
  }
};

export default {
  submitContact,
  getAllInquiries,
  updateInquiryStatus,
  subscribeNewsletter,
  getAllSubscribers,
};
