import mongoose from "mongoose";

const PromptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  prompt: {
    data: { type: Buffer, required: true }, // Store file data as binary
    contentType: String, // Store MIME type (e.g., 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  },
  username: {
    type: String,
  },
  price: {
    type: Number,
  },
  category: {
    type: String,
  },
  exampleInput: {
    type: String,
  },
  exampleOutput: {
    type: String,
  },
  model: {
    type: String,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
});

export const PromptModel = mongoose.model('Prompt', PromptSchema);
