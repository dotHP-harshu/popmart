import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authenticateUser, requireRole } from '../middleware/auth';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';

const router = Router();

// allowed status transitions for the order state machine
const allowedTransitions: Record<string, string[]> = {
  pending: ['approved', 'cancelled'],
  approved: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

router.get('/products', authenticateUser, requireRole(['seller']), async (req: AuthRequest, res: Response) => {
  try {
    const productList = await Product.find({ sellerId: req.userId });
    res.json({ success: true, data: productList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/products', authenticateUser, requireRole(['seller']), async (req: AuthRequest, res: Response) => {
  try {
    const sellerUser = await User.findById(req.userId);
    if (!sellerUser || !sellerUser.isApproved) {
      return res.status(403).json({ success: false, error: 'Seller not approved yet' });
    }

    const { productName, price, stockQuantity, description } = req.body;

    if (!productName || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({ success: false, error: 'Product name, price, and stock are required' });
    }

    const newProduct = await Product.create({
      sellerId: req.userId,
      productName,
      price,
      stockQuantity,
      description: description || '',
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/products/:id', authenticateUser, requireRole(['seller']), async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not your product' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/orders', authenticateUser, requireRole(['seller']), async (req: AuthRequest, res: Response) => {
  try {
    const sellerProducts = await Product.find({ sellerId: req.userId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    const sellerOrders = await Order.find({ 'orderItems.productId': { $in: sellerProductIds } })
      .populate('buyerId', 'fullName email')
      .populate('orderItems.productId');

    res.json({ success: true, data: sellerOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/orders/:id/status', authenticateUser, requireRole(['seller']), async (req: AuthRequest, res: Response) => {
  try {
    const { newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({ success: false, error: 'newStatus is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // make sure this order has at least one of this seller's products
    const sellerProducts = await Product.find({ sellerId: req.userId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id.toString());
    const hasSellerProduct = order.orderItems.some(item => sellerProductIds.includes(item.productId.toString()));

    if (!hasSellerProduct) {
      return res.status(403).json({ success: false, error: 'This order does not contain your products' });
    }

    // check if the transition is allowed
    const currentStatus = order.orderStatus;
    const allowed = allowedTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      return res.status(400).json({ success: false, error: `Cannot transition from ${currentStatus} to ${newStatus}` });
    }

    // restore stock if order is cancelled from pending or approved
    if (newStatus === 'cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: item.quantity } });
      }
    }

    order.orderStatus = newStatus as typeof order.orderStatus;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
