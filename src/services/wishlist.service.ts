import User from '../models/User';
import Product from '../models/Product';
import { Types } from 'mongoose';

export class WishlistService {
  async getWishlist(userId: string) {
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      match: { isActive: true },
      select: 'name slug price originalPrice discountPercent rating reviewsCount images stock selectedSize origin',
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.wishlist || [];
  }

  async toggleWishlist(userId: string, productId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const prodObjectId = new Types.ObjectId(productId);
    const wishlist = user.wishlist || [];
    const index = wishlist.findIndex((id) => id.toString() === productId);

    let isAdded = false;
    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(prodObjectId);
      isAdded = true;
    }

    user.wishlist = wishlist;
    await user.save();

    return {
      isWishlisted: isAdded,
      wishlist,
      message: isAdded ? 'Saved to wishlist 🍯' : 'Removed from wishlist',
    };
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;
