import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import sellerRoutes from './routes/seller';
import buyerRoutes from './routes/buyer';
import dns from 'node:dns';


// Force Node.js to use specific public DNS servers for Atlas SRV resolution
dns.setServers([
  '8.8.8.8', // Google DNS
  '8.8.4.4', // Google DNS Secondary
  '1.1.1.1'  // Cloudflare DNS
]);


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'PopMart API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();
