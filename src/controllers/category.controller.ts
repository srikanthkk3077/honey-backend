import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import { sendSuccess, sendError } from '../utils/response';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }
    return sendSuccess(res, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      return sendError(res, 'Category name is required', 400);
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return sendError(res, 'Category with this name already exists', 400);
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
    });

    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { name, description, image, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    if (name) {
      category.name = name;
      category.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return sendSuccess(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }
    return sendSuccess(res, 'Category deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
