import mongoose from "mongoose";
import {v4 as uuidv4} from 'uuid'

// Define the schema for the issues
const IssueSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    default: uuidv4, // Automatically generate a unique ticket ID using UUID
    unique: true, // Ensure it's unique in the database
  },
  name: {
    type: String,
    required: true, // User must provide their name
  },
  email: {
    type: String,
    required: true, // User must provide their email
  },
  message: {
    type: String,
    required: true, // User must provide a description of the issue
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"], // The status of the issue
    default: "Open", // Default status is "Open"
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
});

// Export the model
export const Issue = mongoose.model("Issue", IssueSchema);


