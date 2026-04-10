import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authenticateUser, requireRole } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

router.get('/pending-sellers', authenticateUser, requireRole(['admin']), async (_req: AuthRequest, res: Response) => {
  try {
    const pendingSellers = await User.find({ role: 'seller', isApproved: false }).select('-passwordHash');
    res.json({ success: true, data: pendingSellers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/sellers/:id/approve', authenticateUser, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
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

export default router;
