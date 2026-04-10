import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authenticateUser, requireRole } from '../middleware/auth';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

const router = Router();

router.get('/products', authenticateUser, requireRole(['buyer']), async (_req: AuthRequest, res: Response) => {
  try {
    const availableProducts = await Product.find({ stockQuantity: { $gt: 0 } }).populate('sellerId', 'fullName');
    res.json({ success: true, data: availableProducts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/orders', authenticateUser, requireRole(['buyer']), async (req: AuthRequest, res: Response) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found: ${item.productId}` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, error: `Not enough stock for ${product.productName}` });
      }

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
      totalAmount += product.price * item.quantity;
    }

    // Deduct stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stockQuantity: -item.quantity } });
    }

    const newOrder = await Order.create({
      buyerId: req.userId,
      orderItems,
      totalAmount,
      orderStatus: 'pending',
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/orders', authenticateUser, requireRole(['buyer']), async (req: AuthRequest, res: Response) => {
  try {
    const buyerOrders = await Order.find({ buyerId: req.userId }).populate('orderItems.productId');
    res.json({ success: true, data: buyerOrders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
