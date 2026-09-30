import Category from '../models/Category';
import Product from '../models/Product';
import { ICategory } from '../types';

export class CategoryService {
  async getAllCategories() {
    const categories = await Category.find({ isActive: true }).sort('name');

    // Dynamically calculate product count for accuracy
    const enriched = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          $or: [{ category: cat._id }, { categorySlug: cat.slug }],
          isActive: true,
        });
        const obj = cat.toJSON();
        obj.productCount = count;
        return obj;
      })
    );

    return enriched;
  }

  async getCategoryById(id: string) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    const count = await Product.countDocuments({
      $or: [{ category: category._id }, { categorySlug: category.slug }],
      isActive: true,
    });
    const obj = category.toJSON();
    obj.productCount = count;
    return obj;
  }

  async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug: slug.toLowerCase() });
    if (!category) {
      throw new Error('Category not found');
    }
    const count = await Product.countDocuments({
      $or: [{ category: category._id }, { categorySlug: category.slug }],
      isActive: true,
    });
    const obj = category.toJSON();
    obj.productCount = count;
    return obj;
  }

  async createCategory(data: Partial<ICategory>) {
    if (!data.name) {
      throw new Error('Category name is required');
    }

    const slug = (
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    ).toLowerCase();

    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new Error('Category with this name or slug already exists');
    }

    const category = await Category.create({
      ...data,
      slug,
      productCount: 0,
    });

    return category;
  }

  async updateCategory(id: string, data: Partial<ICategory>) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    if (data.name) {
      category.name = data.name.trim();
      if (!data.slug) {
        category.slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
    }
    if (data.slug) category.slug = data.slug.toLowerCase().trim();
    if (data.description !== undefined) category.description = data.description;
    if (data.image !== undefined) category.image = data.image;
    if (data.isActive !== undefined) category.isActive = data.isActive;

    await category.save();
    return category;
  }

  async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }
}

export const categoryService = new CategoryService();
export default categoryService;
