

import mongoose from 'mongoose';

const SignupSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  accountType: { type: String, enum: ['user', 'admin'], default: 'user' },
  joinedDate:{type:Date,default:Date.now},
  bio: { type: String, default: '' },
  lastLogin: { type: Date, default: null }, // Track last login time
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
  website: { type: String, default: '' },
  // Add user analytics fields
  totalUsers: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  location: {
    country: String,
    region: String,
    city: String,
  },
 
});

export const SignupModel = mongoose.model('users', SignupSchema);
