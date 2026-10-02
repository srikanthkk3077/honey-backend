import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      search,
      category,
      categorySlug,
      honeyType,
      minPrice,
      maxPrice,
      isFeatured,
      isBestSeller,
      isOrganicCertified,
      inStock,
      page,
      limit,
      sort,
    } = req.query;

    const result = await productService.getAllProducts({
      search: search as string,
      category: category as string,
      categorySlug: categorySlug as string,
      honeyType: honeyType as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      isBestSeller: isBestSeller !== undefined ? isBestSeller === 'true' : undefined,
      isOrganicCertified: isOrganicCertified !== undefined ? isOrganicCertified === 'true' : undefined,
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

export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const limit = req.query.limit ? Number(req.query.limit) : 4;
    const related = await productService.getRelatedProducts(id, limit);
    return sendSuccess(res, 'Related products fetched successfully', related);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, description, category, price, originalPrice, stock } = req.body;

    if (!name || !description || !category || price === undefined) {
      return sendError(res, 'Missing required fields: name, description, category, price', 400);
    }

    const payload = {
      ...req.body,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      stock: stock !== undefined ? Number(stock) : (req.body.stockQuantity ? Number(req.body.stockQuantity) : 0),
    };

    const product = await productService.createProduct(payload);
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

export const addReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const productId = req.params.id as string;
    const { userName, rating, comment } = req.body;

    if (!rating || !comment) {
      return sendError(res, 'Rating and comment are required', 400);
    }

    const name = userName || req.user?.name || 'Verified Beekeeper';
    const userId = req.user?.id;

    const product = await productService.addReview(productId, {
      user: userId,
      userName: name,
      rating: Number(rating),
      comment: comment.trim(),
      verified: !!userId,
    });

    return sendSuccess(res, 'Review added successfully', product);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id, reviewId } = req.params;
    const product = await productService.deleteReview(id as string, reviewId as string);
    return sendSuccess(res, 'Review removed successfully', product);
  } catch (error) {
    next(error);
  }
};


export const getAllReviews = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const reviews = await productService.getAllReviews();
    return sendSuccess(res, 'Reviews fetched successfully', reviews);
  } catch (error) {
    next(error);
  }
};

export const getHomeReviews = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const reviews = await productService.getHomeReviews();
    return sendSuccess(res, 'Home reviews fetched successfully', reviews);
  } catch (error) {
    next(error);
  }
};

export const toggleReviewHome = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id, reviewId } = req.params;
    const { showOnHome } = req.body;
    const result = await productService.toggleReviewHome(id as string, reviewId as string, showOnHome);
    return sendSuccess(res, 'Review home visibility updated', result);
  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
  getAllReviews,
  getHomeReviews,
  toggleReviewHome,
};
