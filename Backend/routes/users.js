import express from 'express';
import { User } from '../models/user.model.js';
import { sendAdminPermissionRequestEmail } from '../mailtrap/emails.js';
import { verifyToken } from '../middleware/verifyToken.js';
import Chart from '../models/Chart.js';
import FileUpload from '../models/FileUpload.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();
router.get('/', isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pending admin permission requests
router.get('/admin-requests', isAdmin, async (req, res) => {
    try {
        const requests = await User.find({ adminRequestStatus: 'pending' }).select('-password');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Respond to an admin request (approve or deny)
router.post('/respond-admin-request/:userId', isAdmin, async (req, res) => {
    try {
        const { action } = req.body; // 'approve' or 'deny'
        const targetUser = await User.findById(req.params.userId);

        if (!targetUser) return res.status(404).json({ error: 'Target user not found.' });

        if (action === 'approve') {
            targetUser.role = 'admin';
            targetUser.adminRequestStatus = 'approved';
        } else if (action === 'deny') {
            targetUser.adminRequestStatus = 'denied';
        } else {
            return res.status(400).json({ error: 'Invalid action.' });
        }
        await targetUser.save();
        res.json({ success: true, message: `User request has been ${action}d.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a user and their associated content
router.delete('/:userId', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await Chart.deleteMany({ createdBy: req.params.userId });
    await FileUpload.deleteMany({ uploadedBy: req.params.userId });
    await User.findByIdAndDelete(req.params.userId);

    res.json({ success: true, message: 'User and all associated content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- USER-ACCESSIBLE ROUTES ---

// This route allows a user to request admin access.
router.post('/request-admin', verifyToken, async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ error: 'A reason is required.' });
        
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        user.adminRequestStatus = 'pending';
        user.adminRequestReason = reason;
        await user.save();

        await sendAdminPermissionRequestEmail(process.env.ADMIN_NOTIFICATION_EMAIL, user.name, user.email, reason);

        res.json({ success: true, message: 'Admin access request submitted.', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/analytics/increment', verifyToken, async (req, res) => {
    try {
        const { field } = req.body;
        if (!field || !['filesUploaded', 'chartsCreated', 'totalDownloads', 'aiInsightsGenerated'].includes(field)) {
            return res.status(400).json({ error: 'A valid analytics field is required.' });
        }
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        await user.updateAnalytics(field);
        
        // Return the updated user object (excluding password)
        const updatedUser = await User.findById(req.userId).select('-password');
        res.json({ success: true, message: `${field} updated.`, user: updatedUser });

    } catch (error) {
        res.status(500).json({ error: 'Server error while updating analytics.' });
    }
});

export default router;