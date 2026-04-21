import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authenticateUser, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

const router = Router();

// admin guard applied to every route below
const adminGuard = [authenticateUser, requireRole(['admin'])];

// --- stats ---

router.get('/stats', ...adminGuard, async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const pendingApprovals = await User.countDocuments({ role: 'seller', isApproved: false });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSellers,
        totalBuyers,
        pendingApprovals,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// --- pending sellers (kept for backward compat) ---

router.get('/pending-sellers', ...adminGuard, async (_req: AuthRequest, res: Response) => {
  try {
    const pendingSellers = await User.find({ role: 'seller', isApproved: false }).select('-passwordHash');
    res.json({ success: true, data: pendingSellers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// --- approve seller ---

router.put('/sellers/:id/approve', ...adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ success: false, error: 'Seller not found' });
    }

    seller.isApproved = true;
    await seller.save();

    res.json({ success: true, data: { id: seller._id, fullName: seller.fullName, isApproved: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// --- user management ---

router.get('/users', ...adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const userList = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, data: userList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/users/:id/status', ...adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // cannot suspend or delete another admin
    if (targetUser.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot modify admin accounts' });
    }

    targetUser.isActive = req.body.isActive;
    await targetUser.save();

    res.json({ success: true, data: { id: targetUser._id, isActive: targetUser.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/users/:id', ...adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (targetUser.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot delete admin accounts' });
    }

    // if seller, cascade delete their products
    if (targetUser.role === 'seller') {
      await Product.deleteMany({ sellerId: targetUser._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: { id: targetUser._id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// --- product management ---

router.get('/products', ...adminGuard, async (_req: AuthRequest, res: Response) => {
  try {
    const allProducts = await Product.find()
      .populate('sellerId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: allProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/products/:id', ...adminGuard, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: { id: product._id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// --- order management ---

router.get('/orders', ...adminGuard, async (_req: AuthRequest, res: Response) => {
  try {
    const allOrders = await Order.find()
      .populate('buyerId', 'fullName email')
      .populate('orderItems.productId', 'productName price images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: allOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
