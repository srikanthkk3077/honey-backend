import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { search, category, honeyType, minPrice, maxPrice, isFeatured, inStock, page, limit, sort } = req.query;

    const result = await productService.getAllProducts({
      search: search as string,
      category: category as string,
      honeyType: honeyType as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      inStock: inStock !== undefined ? inStock === 'true' : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort: sort as string,
    });

    return sendSuccess(res, 'Products fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const product = await productService.getProductById(id);
    return sendSuccess(res, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const slug = req.params.slug as string;
    const product = await productService.getProductBySlug(slug);
    return sendSuccess(res, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, description, category, price, discountPrice, stockQuantity, weight, honeyType, origin, images, isFeatured } = req.body;

    if (!name || !description || !category || price === undefined || stockQuantity === undefined || !weight) {
      return sendError(res, 'Missing required fields: name, description, category, price, stockQuantity, weight', 400);
    }

    const product = await productService.createProduct({
      name,
      description,
      category,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stockQuantity: Number(stockQuantity),
      weight,
      honeyType,
      origin,
      images,
      isFeatured,
    });

    return sendSuccess(res, 'Product created successfully', product, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const updated = await productService.updateProduct(id, req.body);
    return sendSuccess(res, 'Product updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    await productService.deleteProduct(id);
    return sendSuccess(res, 'Product deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
