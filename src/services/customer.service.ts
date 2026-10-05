import User from '../models/User';
import Order from '../models/Order';
import { ICustomerSummary } from '../types';

export class CustomerService {
  async getAllCustomers(filters: { search?: string; status?: string; page?: number; limit?: number }) {
    const { search, status, page = 1, limit = 20 } = filters;
    const query: any = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    // Aggregate orders for each customer
    const customers: ICustomerSummary[] = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({
          $or: [{ user: u._id }, { customerEmail: u.email }],
        })
          .select('total orderStatus createdAt')
          .sort('-createdAt')
          .lean();

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, o) => (o.orderStatus !== 'cancelled' ? sum + o.total : sum), 0);
        const lastOrderDate = orders[0] && orders[0].createdAt ? new Date(orders[0].createdAt).toISOString().split('T')[0] : null;

        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          totalOrders,
          totalSpent,
          lastOrderDate,
          status: u.isActive ? 'active' : 'inactive',
          joinedDate: u.createdAt ? u.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          city: u.address?.city || 'Unspecified',
        };
      })
    );

    return {
      customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getCustomerById(id: string) {
    const customer = await User.findById(id).select('-password');
    if (!customer) {
      throw new Error('Customer not found');
    }

    const orders = await Order.find({
      $or: [{ user: customer._id }, { customerEmail: customer.email }],
    }).sort('-createdAt');

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => (o.orderStatus !== 'cancelled' ? sum + o.total : sum), 0);

    return {
      customer,
      totalOrders,
      totalSpent,
      orders,
    };
  }

  async updateCustomerStatus(id: string, isActive: boolean) {
    const customer = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  async getCustomerStats() {
    const [totalCustomers, activeCustomers, startOfMonth] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', isActive: true }),
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ]);

    const newCustomersThisMonth = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startOfMonth },
    });

    return {
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
    };
  }
}

export const customerService = new CustomerService();
export default customerService;
