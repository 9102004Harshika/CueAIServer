
import { ActivityModel } from "../models/Activity.js"
export const RecentActivity= async (req, res) => {
    const { username, activity } = req.body;
    try {
      const newActivity = new ActivityModel({
        username,
        activity
      });
      await newActivity.save();
      res.status(201).json(newActivity);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
export const GetActivity=async (req, res) => {
    const { username } = req.params;
  
    try {
      const activities = await ActivityModel.find({ username });
      res.json(activities);

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  