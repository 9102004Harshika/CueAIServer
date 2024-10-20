
import { SignupModel } from "../models/Signup.js"
import nodemailer from "nodemailer"
import NodeCache from 'node-cache';
import { PromptModel } from "../models/Prompt.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from "crypto"
const JWT_SECRET= "cueAi"


// In-memory OTP storage (you can use a database if required)
let otps = {};

// Nodemailer configuration for sending OTP emails
const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can change this to any email provider
  auth: {
    user: "harshikagawade@gmail.com", // Your email address
    pass: "nnve hhre ydog lqob", // Your email password
  },
});

// Generate OTP
const generateOTP = () => {
  return crypto.randomBytes(3).toString('hex'); // Generates a 6-character OTP
};

// Send OTP via email
const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: "harshikagawade@gmail.com",
    to: email,
    subject: 'Your OTP for login',
    text: `Your one-time password (OTP) is: ${otp}. This OTP is valid for 10 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};

// Send OTP to user's email
export const SendOtpForLogin = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await SignupModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP and store it temporarily (expires after 10 minutes)
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // OTP expires after 10 minutes
    otps[email] = { otp, expiresAt };

    // Send the OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Verify OTP and login
export const VerifyOtpAndLogin = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await SignupModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists and is valid
    const storedOtp = otps[email];
    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
    }

    if (storedOtp.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, proceed with login

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, accountType: user.accountType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Clean up the OTP (remove it from memory)
    delete otps[email];

    // Respond with the token and user details
    res.json({
      message: 'Login successful',
      token,
      user: {
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        accountType: user.accountType,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const Signup=async (req, res) => {


  const { fname, lname, email,  accountType, joinedDate, bio, lastLogin, twitter, instagram, website } = req.body;
  const location = req.location;

  const newUser = new SignupModel({
    fname,
    lname,
    email,
    accountType,
    joinedDate,
    bio,
    lastLogin,
    twitter,
    instagram,
    website,
    location,
  });

  try {
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
}
export const Admin=async (req, res) => {
  const { fname, lname, email, } = req.body;
  try {
    const newAdmin = new SignupModel({ fname, lname, email, accountType: 'admin' });
    await newAdmin.save();
    res.status(200).json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const Users=async (req, res) => {
  const { email } = req.body;
  try {
    const user = await SignupModel.findOne({ email });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export const User=async (req, res) => {
  try {
    const user = await SignupModel.findOne({fname:req.params.username});
    if (user) {
      res.status(200).json({
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        joinedDate: user.joinedDate,
        bio:user.bio,
        twitter:user.twitter,
        instagram:user.instagram,
        website:user.website,
        image:user.image
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export const UpdateUser=async (req, res) => {
  const { fname, lname, email, bio, twitter, instagram, website } = req.body;

  try {
    const user = await SignupModel.findOneAndUpdate(
      { fname:req.params.username },
      { fname, lname, email, bio, twitter, instagram, website },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const otpCache = new NodeCache({ stdTTL: 600 });//otp will expire 10 
export const Otp = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'harshikagawade@gmail.com', // Your email address
      pass: 'nnve hhre ydog lqob' // Your email password (consider using environment variables)
    }
  });
  const { email } = req.body;

  try {
    const user = await SignupModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate OTP (4 digits)
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Store the OTP in the cache with the user's email as the key
    otpCache.set(email, otp);

    const mailOptions = {
      from: 'harshikagawade@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Hello ${user.fname},Your OTP for password reset is: ${otp}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send email:', error);
        return res.status(500).json({ message: 'Failed to send OTP.' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'OTP sent successfully.' });
    });
   } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

export const VerifyOtp = (req, res) => {
  const { email, otp } = req.body;

  // Get the OTP from the cache
  const cachedOtp = otpCache.get(email);

  if (!cachedOtp) {
    return res.status(400).json({ message: 'OTP has expired or is invalid.' });
  }

  if (parseInt(otp) !== cachedOtp) {
    return res.status(400).json({ message: 'Invalid OTP.' });
  }

  // OTP is valid
  otpCache.del(email); // Optionally delete the OTP after successful verification
  res.status(200).json({ message: 'OTP verified successfully.' });
}
export const ResetPassword=async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await SignupModel.findOne({ email :email});
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.pass = newPassword;
    user.cpass = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password.' });
  }
};

export const DeletedPrompts=async (req, res) => {
  try {
    const { username } = req.params;
    const deletedPrompts = await PromptModel.find({ user: username, deleted: true });
    res.json(deletedPrompts);
  } catch (error) {
    res.status(500).send('Error fetching deleted prompts: ' + error.message);
  }
}
