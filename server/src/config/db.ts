import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log('MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
