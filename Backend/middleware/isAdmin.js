import { User } from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Forbidden: Requires admin role' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};