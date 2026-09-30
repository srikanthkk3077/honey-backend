import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/category.service';
import { sendSuccess, sendError } from '../utils/response';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const categories = await categoryService.getAllCategories();
    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const category = await categoryService.getCategoryById(id);
    return sendSuccess(res, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const slug = req.params.slug as string;
    const category = await categoryService.getCategoryBySlug(slug);
    return sendSuccess(res, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, slug, description, image } = req.body;
    if (!name) {
      return sendError(res, 'Category name is required', 400);
    }

    const category = await categoryService.createCategory({
      name,
      slug,
      description,
      image,
    });

    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const category = await categoryService.updateCategory(id, req.body);
    return sendSuccess(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    await categoryService.deleteCategory(id);
    return sendSuccess(res, 'Category deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
