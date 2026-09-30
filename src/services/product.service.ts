import Product from '../models/Product';
import { IProduct } from '../types';

export interface ProductQueryFilters {
  search?: string;
  category?: string;
  honeyType?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export class ProductService {
  async getAllProducts(filters: ProductQueryFilters) {
    const {
      search,
      category,
      honeyType,
      minPrice,
      maxPrice,
      isFeatured,
      inStock,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = filters;

    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (honeyType) {
      query.honeyType = honeyType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured;
    }

    if (inStock) {
      query.stockQuantity = { $gt: 0 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getProductById(id: string) {
    const product = await Product.findById(id).populate('category', 'name slug description');
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug description');
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(data: Partial<IProduct>) {
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Check slug collision
    const existing = await Product.findOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const product = await Product.create(data);
    return product.populate('category', 'name slug');
  }

  async updateProduct(id: string, data: Partial<IProduct>) {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!product) {
      throw new Error('Product not found to update');
    }

    return product;
  }

  async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new Error('Product not found to delete');
    }
    return product;
  }
}

export const productService = new ProductService();
export default productService;
