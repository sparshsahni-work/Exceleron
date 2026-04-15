import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendWelcomeEmail,
	sendWelcomeWithVerificationEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			return res.status(400).json({ success: false, message: "All fields are required" });
		}

		const userAlreadyExists = await User.findOne({ email });

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		// FIX: Removed the manual hashing line: `const hashedPassword = await bcryptjs.hash(password, 10);`
		// The password will now be hashed only once by the middleware in `user.model.js`.
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password, // Pass the plain, unhashed password here. The model will handle hashing.
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();

		generateTokenAndSetCookie(res, user._id);

		await sendWelcomeWithVerificationEmail(user.email, user.name, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined, // Ensure password is not sent in the response
			},
		});
	} catch (error) {
		console.error("Error in signup controller:", error);
		res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		// This comparison will now work correctly because the password is no longer double-hashed.
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(200).json({ success: true, message: "If an account with this email exists, a password reset link has been sent." });
		}

		const resetToken = crypto.randomBytes(20).toString("hex");
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
		await user.save();

		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		user.password = password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(401).json({ success: false, message: "User not found" });
		}
		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const verifyAdminKey = async (req, res) => {
	const { adminKey } = req.body;
	try {
		const user = await User.findById(req.userId);
		if (user.role !== 'admin') {
			return res.status(403).json({ success: false, message: "Forbidden: Not an admin" });
		}
		if (adminKey === process.env.ADMIN_SECRET_KEY) {
			return res.status(200).json({ success: true, message: "Admin key verified." });
		} else {
			return res.status(401).json({ success: false, message: "Invalid admin key." });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error during admin verification." });
	}
};
