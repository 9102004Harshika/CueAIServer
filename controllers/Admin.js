import { PromptModel } from "../models/Prompt.js"; 
import { SignupModel } from "../models/Signup.js";
import { ActivityModel } from "../models/Activity.js";

export const ApprovePrompt = (req, res) => {
    const prompt = new PromptModel(req.body);
    prompt.status = 'pending';
    prompt.save()
      .then(() => res.status(200).send('Prompt submitted for approval'))
      .catch(err => res.status(400).send(err));
}

export const PendingPrompts = (req, res) => {
    PromptModel.find({ status: 'pending' })
      .then(prompts => res.status(200).json(prompts))
      .catch(err => res.status(400).send(err));
}

export const ApprovedPrompts = (req, res) => {
    const { id } = req.params;
    PromptModel.findByIdAndUpdate(id, { status: 'approved' })
      .then(() => res.status(200).send('Prompt approved'))
      .catch(err => res.status(400).send(err));
}
export const GetStats = async (req, res) => {
    try {
        const startDate = new Date(new Date() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

        // Total users with accountType 'user'
        const totalUsers = await SignupModel.countDocuments({ accountType: 'user' });

        // Active users (logged in within the last 30 days)
        const activeUsers = await SignupModel.countDocuments({
            accountType: 'user',
            lastLogin: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
        });

        // Users logged in within the last 7 days
        const recentUsers = await SignupModel.countDocuments({
            accountType: 'user',
            lastLogin: { $gte: startDate }
        });

        // Calculate retention rate
        const retentionRate = (recentUsers / totalUsers) * 100;
        const retention = retentionRate.toFixed(2);

        // Device type detection
        let deviceType = 'unknown';
        if (req.useragent.isMobile) {
            deviceType = 'mobile';
        } else if (req.useragent.isTablet) {
            deviceType = 'tablet';
        } else if (req.useragent.isDesktop) {
            deviceType = 'desktop';
        }

        // Check for laptop - this is a heuristic approach
        if (deviceType === 'desktop') {
            const ua = req.useragent.source.toLowerCase();
            if (ua.includes('laptop') || (req.useragent.os === 'Windows' && (ua.includes('intel') || ua.includes('amd')))) {
                deviceType = 'laptop';
            }
        }

        // Aggregate distribution by location
        const distribution = await SignupModel.aggregate([
            {
                $match: {
                    accountType: 'user',
                    location: { $nin: ['Local', 'Unknown'] } // Exclude local or unknown locations
                }
            },
            {
                $group: {
                    _id: {
                        country: '$location.country',
                        region: '$location.region',
                        city: '$location.city'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    location: '$_id',
                    count: 1
                }
            }
        ]);

        // Count device types
        const deviceCounts = {
            mobile: 0,
            tablet: 0,
            desktop: 0,
            laptop: 0
        };

        const users = await SignupModel.find({ accountType: 'user' });
        users.forEach(user => {
            let ua = req.useragent;
            if (ua.isMobile) {
                deviceCounts.mobile++;
            } else if (ua.isTablet) {
                deviceCounts.tablet++;
            } else if (ua.isDesktop) {
                deviceCounts.desktop++;
            }

            if (deviceCounts.desktop > 0) {
                ua = ua.source.toLowerCase();
                if (ua.includes('laptop') || (ua.os === 'Windows' && (ua.includes('intel') || ua.includes('amd')))) {
                    deviceCounts.laptop++;
                    deviceCounts.desktop--;
                }
            }
        });

        // User activity aggregation for line and bar charts
        const userActivity = await ActivityModel.aggregate([
            {
                $group: {
                    _id: {
                        hour: { $hour: "$date" },
                        dayOfWeek: { $dayOfWeek: "$date" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.dayOfWeek": 1,
                    "_id.hour": 1
                }
            }
        ]);


        // Include device counts and user activity in the response
        res.json({ totalUsers, activeUsers, retention, distribution, deviceCounts, userActivity });
    } catch (err) {
        console.error('Error fetching user analytics:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const GetPromptStats=async (req, res) => {
    try {
      // Get count of prompts per category
      const categoryDistribution = await PromptModel.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } }
      ]);
  
      // Get count of prompts per month
      const monthlyPrompts = await PromptModel.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $project: { month: "$_id", count: 1, _id: 0 } }
      ]);
  
      // Get counts of prompt statuses
      const promptStatusCounts = await PromptModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        { $project: { status: "$_id", count: 1, _id: 0 } }
      ]);
  
      // Get counts of prompts by model or type (Device Usage)
      const deviceUsage = await PromptModel.aggregate([
        {
          $group: {
            _id: "$model", // Change to "$type" if you track types instead
            count: { $sum: 1 }
          }
        },
        { $project: { model: "$_id", count: 1, _id: 0 } }
      ]);
  
      // Get counts for conversion funnel stages
      const conversionFunnel = [
        { stage: 'Submitted', count: await PromptModel.countDocuments() },
        { stage: 'Reviewed', count: await PromptModel.countDocuments({ status: { $ne: 'pending' } }) },
        { stage: 'Approved', count: await PromptModel.countDocuments({ status: 'approved' }) }
      ];
  
      // Get daily or weekly prompt activity (User Activity Heatmap)
      const userActivity = await PromptModel.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } }
      ]);
  
      res.status(200).json({
        categoryDistribution,
        monthlyPrompts,
        promptStatusCounts,
        deviceUsage,
        conversionFunnel,
        userActivity
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching prompt stats", error });
    }
  };