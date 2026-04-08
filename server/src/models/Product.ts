import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productName: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
