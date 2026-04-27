const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/popmart';

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['admin', 'seller', 'buyer'] },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productName: String,
  description: String,
  price: Number,
  stockQuantity: Number,
  images: [String],
  category: { type: String, default: 'General' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    priceAtPurchase: Number,
  }],
  totalAmount: Number,
  orderStatus: { type: String, enum: ['pending', 'approved', 'shipped', 'delivered', 'cancelled'] },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

function loadJSON(filename) {
  const filePath = path.join(__dirname, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function convertMongoJSON(doc) {
  const converted = { ...doc };
  if (converted._id && converted._id.$oid) {
    converted._id = new mongoose.Types.ObjectId(converted._id.$oid);
  }
  if (converted.sellerId && converted.sellerId.$oid) {
    converted.sellerId = new mongoose.Types.ObjectId(converted.sellerId.$oid);
  }
  if (converted.buyerId && converted.buyerId.$oid) {
    converted.buyerId = new mongoose.Types.ObjectId(converted.buyerId.$oid);
  }
  if (converted.orderItems) {
    converted.orderItems = converted.orderItems.map(item => ({
      ...item,
      productId: new mongoose.Types.ObjectId(item.productId.$oid),
    }));
  }
  if (converted.createdAt && converted.createdAt.$date) {
    converted.createdAt = new Date(converted.createdAt.$date);
  }
  if (converted.updatedAt && converted.updatedAt.$date) {
    converted.updatedAt = new Date(converted.updatedAt.$date);
  }
  delete converted.__v;
  return converted;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  // clear existing data
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});

  // seed users
  console.log('Seeding users...');
  const usersData = loadJSON('users.json').map(convertMongoJSON);
  await User.insertMany(usersData);
  console.log(`  Inserted ${usersData.length} users`);

  // seed products
  console.log('Seeding products...');
  const productsData = loadJSON('products.json').map(convertMongoJSON);
  await Product.insertMany(productsData);
  console.log(`  Inserted ${productsData.length} products`);

  // seed orders
  console.log('Seeding orders...');
  const ordersData = loadJSON('orders.json').map(convertMongoJSON);
  await Order.insertMany(ordersData);
  console.log(`  Inserted ${ordersData.length} orders`);

  console.log('\nSeed complete!');
  console.log('\nDefault login: any email from SEED_README.md with password "password123"');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
