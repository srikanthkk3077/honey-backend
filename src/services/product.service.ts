import Product from '../models/Product';
import Category from '../models/Category';
import { IProduct, IProductReview } from '../types';

export interface ProductQueryFilters {
  search?: string;
  category?: string;
  categorySlug?: string;
  honeyType?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isOrganicCertified?: boolean;
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
      categorySlug,
      honeyType,
      minPrice,
      maxPrice,
      isFeatured,
      isBestSeller,
      isOrganicCertified,
      inStock,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = filters;

    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { nectarSource: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      // Check if category is an ObjectId or slug/name
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const foundCat = await Category.findOne({
          $or: [{ slug: category.toLowerCase() }, { name: new RegExp(`^${category}$`, 'i') }],
        });
        if (foundCat) {
          query.category = foundCat._id;
        } else {
          query.categorySlug = category.toLowerCase();
        }
      }
    } else if (categorySlug) {
      query.categorySlug = categorySlug.toLowerCase();
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

    if (isBestSeller !== undefined) {
      query.isBestSeller = isBestSeller;
    }

    if (isOrganicCertified !== undefined) {
      query.isOrganicCertified = isOrganicCertified;
    }

    if (inStock) {
      query.stock = { $gt: 0 };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug image')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getProductById(id: string) {
    const product = await Product.findById(id).populate('category', 'name slug description image');
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug: slug.toLowerCase() }).populate('category', 'name slug description image');
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async getRelatedProducts(productId: string, limit = 4) {
    const current = await Product.findById(productId);
    if (!current) return [];

    const related = await Product.find({
      _id: { $ne: current._id },
      category: current.category,
      isActive: true,
    })
      .limit(limit)
      .populate('category', 'name slug');

    // If fewer than limit, fetch other featured or active products
    if (related.length < limit) {
      const more = await Product.find({
        _id: { $nin: [current._id, ...related.map((r) => r._id)] },
        isActive: true,
      })
        .limit(limit - related.length)
        .populate('category', 'name slug');
      return [...related, ...more];
    }

    return related;
  }

  async createProduct(data: Partial<IProduct>) {
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Resolve category to ObjectId if string
    if (data.category && typeof data.category === 'string' && !data.category.match(/^[0-9a-fA-F]{24}$/)) {
      let cat = await Category.findOne({
        $or: [{ slug: data.category.toLowerCase() }, { name: data.category }],
      });
      if (!cat) {
        cat = await Category.findOne();
        if (!cat) {
          cat = await Category.create({
            name: data.category,
            slug: data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          });
        }
      }
      data.category = cat._id;
      data.categorySlug = cat.slug;
    }

    // Check slug collision
    const existing = await Product.findOne({ slug: data.slug });
    if (existing) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const product = await Product.create(data);

    // Update category product count
    if (product.category) {
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });
    }

    return product.populate('category', 'name slug image');
  }

  async updateProduct(id: string, data: Partial<IProduct>) {
    if (data.name && !data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Resolve category to ObjectId if provided as string
    if (data.category && typeof data.category === 'string' && !data.category.match(/^[0-9a-fA-F]{24}$/)) {
      const cat = await Category.findOne({
        $or: [{ slug: data.category.toLowerCase() }, { name: data.category }],
      });
      if (cat) {
        data.category = cat._id;
        data.categorySlug = cat.slug;
      } else {
        delete data.category;
      }
    }

    let oldProduct: any = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      oldProduct = await Product.findById(id);
    }
    if (!oldProduct) {
      oldProduct = await Product.findOne({ slug: id });
    }
    if (!oldProduct) {
      // If updating a product that was created client-side only, create it in MongoDB
      const created = await this.createProduct({ ...data, name: data.name || 'Madhuvan Pure Honey' });
      return created;
    }

    const realId = oldProduct._id;
    const updated = await Product.findByIdAndUpdate(realId, data, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug image');

    // If category changed, update product counts
    if (data.category && oldProduct.category && oldProduct.category.toString() !== data.category.toString()) {
      await Category.findByIdAndUpdate(oldProduct.category, { $inc: { productCount: -1 } });
      await Category.findByIdAndUpdate(data.category, { $inc: { productCount: 1 } });
    }

    return updated;
  }

  async deleteProduct(id: string) {
    let product: any = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndDelete(id);
    }
    if (!product) {
      product = await Product.findOneAndDelete({ slug: id });
    }
    if (!product) {
      // If product ID only existed client-side, consider it deleted
      return { id, message: 'Deleted locally' };
    }

    if (product.category) {
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
    }

    return product;
  }

  async addReview(productId: string, reviewData: {
    user?: string;
    userName: string;
    rating: number;
    comment: string;
    verified?: boolean;
  }) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const newReview = {
      user: reviewData.user as any,
      userName: reviewData.userName,
      rating: Number(reviewData.rating),
      comment: reviewData.comment,
      date: new Date().toISOString().split('T')[0],
      verified: reviewData.verified ?? false,
      showOnHome: (reviewData as any).showOnHome ?? false,
      userRole: (reviewData as any).userRole || 'Verified Patron',
      location: (reviewData as any).location || 'Verified Buyer',
      avatar: (reviewData as any).avatar || '',
    };

    product.reviews.push(newReview as any);
    product.reviewsCount = product.reviews.length;

    // Recalculate average rating
    const totalScore = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((totalScore / product.reviews.length).toFixed(1));

    await product.save();
    return product;
  }

  async deleteReview(productId: string, reviewId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    product.reviews = product.reviews.filter(
      (r: any) => r._id?.toString() !== reviewId && r.id !== reviewId
    );
    product.reviewsCount = product.reviews.length;

    if (product.reviews.length > 0) {
      const totalScore = product.reviews.reduce((acc, r) => acc + r.rating, 0);
      product.rating = Number((totalScore / product.reviews.length).toFixed(1));
    } else {
      product.rating = 5.0;
    }

    await product.save();
    return product;
  }

  async getAllReviews() {
    const products = await Product.find({}, 'name slug images reviews').lean();
    const allReviews: any[] = [];

    for (const prod of products) {
      if (prod.reviews && Array.isArray(prod.reviews)) {
        for (const r of prod.reviews) {
          allReviews.push({
            id: (r as any)._id?.toString() || (r as any).id,
            reviewId: (r as any)._id?.toString() || (r as any).id,
            productId: (prod as any)._id.toString(),
            productName: prod.name,
            productSlug: prod.slug,
            productImage: prod.images?.[0] || '',
            userName: (r as any).userName,
            rating: (r as any).rating,
            comment: (r as any).comment,
            date: (r as any).date,
            verified: (r as any).verified,
            showOnHome: !!(r as any).showOnHome,
            userRole: (r as any).userRole || 'Verified Patron',
            location: (r as any).location || 'Verified Buyer',
            avatar: (r as any).avatar || '',
          });
        }
      }
    }

    allReviews.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    return allReviews;
  }

  async getHomeReviews() {
    const products = await Product.find({ 'reviews.showOnHome': true }, 'name slug images reviews').lean();
    const homeReviews: any[] = [];

    for (const prod of products) {
      if (prod.reviews && Array.isArray(prod.reviews)) {
        for (const r of prod.reviews) {
          if ((r as any).showOnHome) {
            homeReviews.push({
              id: (r as any)._id?.toString() || (r as any).id,
              name: (r as any).userName,
              role: (r as any).userRole || 'Verified Patron',
              location: (r as any).location || 'Verified Buyer',
              avatar: (r as any).avatar || (prod.images?.[0] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'),
              comment: (r as any).comment,
              rating: (r as any).rating,
              productMentioned: prod.name,
              productSlug: prod.slug,
              productId: (prod as any)._id.toString(),
              date: (r as any).date,
            });
          }
        }
      }
    }

    // Sort newest reviews first so admin-handled and latest reviews show front and center
    homeReviews.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    return homeReviews;
  }

  async toggleReviewHome(productId: string, reviewId: string, showOnHome?: boolean) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const review = (product.reviews as any).find(
      (r: any) => r._id?.toString() === reviewId || r.id === reviewId
    );

    if (!review) {
      throw new Error('Review not found');
    }

    if (typeof showOnHome === 'boolean') {
      review.showOnHome = showOnHome;
    } else {
      review.showOnHome = !review.showOnHome;
    }

    product.markModified('reviews');
    await product.save();

    // Atomic update in MongoDB to ensure 100% persistence
    try {
      const reviewObjId = (review as any)._id;
      if (reviewObjId) {
        await Product.updateOne(
          { _id: product._id, 'reviews._id': reviewObjId },
          { $set: { 'reviews.$.showOnHome': review.showOnHome } }
        );
      }
    } catch (err) {
      console.error('Atomic update error:', err);
    }
    return {
      reviewId,
      productId,
      showOnHome: review.showOnHome,
      review,
    };
  }

}


export const productService = new ProductService();
export default productService;
