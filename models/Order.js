import mongoose from 'mongoose';

// Define the schema for the order
const orderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    items: [
      {
        promptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', required: true },
        title: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
      }
    ],
    totalPrice: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

// Create the model using the schema
const Order = mongoose.model('Order', orderSchema);

export default Order;
