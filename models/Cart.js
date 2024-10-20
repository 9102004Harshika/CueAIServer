import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  username: { type: String, required: true },
  promptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
  addedAt: { type: Date, default: Date.now },
});

export const CartModel = mongoose.model('Cart', CartSchema);
