import {v4 as uuidv4} from 'uuid'
import nodemailer from 'nodemailer'
import { Issue } from '../models/Issue.js'; 
export const SubmitIssue=async (req, res) => {
    const { name, email, message } = req.body;
    
    try {
        // Generate a unique ticket ID
        const ticketId = uuidv4();
        const newIssue = new Issue({ id: ticketId, name:name, email:email, message:message, status: 'In Progress' });
        await newIssue.save();
    
      
        // Send email to the user with the ticket ID
        const transporter = nodemailer.createTransport({
          service: 'gmail', // Use your email provider
          auth: {
            user: 'harshikagawade@gmail.com',
            pass: 'nnve hhre ydog lqob',
          },
        });
      
        const mailOptions = {
          from: 'harshikagawade@gmail.com',
          to: email,
          subject: `Ticket Created: ${ticketId}`,
          text: `Dear ${name},\n\nThank you for submitting your issue. Your ticket ID is ${ticketId}.\n\nWe will respond to your issue as soon as possible.\n\nBest Regards,\nCueAI Support Team`
        };
      await transporter.sendMail(mailOptions);
      res.status(200).json({ ticketId, message: 'Issue submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send email' });
    }
  }