// File: backend/index.js
// This is the main entry point for your Node.js server.

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// --- Local Imports ---
import { connectDB } from "./db/connectDB.js";
import { verifyToken } from "./middleware/verifyToken.js";

// --- Route Imports ---
import authRoutes from "./routes/auth.route.js";
import filesRoutes from './routes/files.js';
import chartsRoutes from './routes/charts.js';
import usersRoutes from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';

// --- Configuration ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// --- Middleware ---
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- API Routes ---
app.use("/api/auth", authRoutes); // Public authentication routes

// Protected routes for all authenticated users
app.use("/api/files", verifyToken, filesRoutes);
app.use("/api/charts", verifyToken, chartsRoutes);


app.use("/api/users", verifyToken, usersRoutes);

import { isAdmin } from "./middleware/isAdmin.js"; // Import isAdmin here for analytics
app.use("/api/analytics", verifyToken, isAdmin, analyticsRoutes);

// --- Production Build Configuration ---
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// --- Server Initialization ---
app.listen(PORT, () => {
	connectDB();
	console.log(`Server is running on port: ${PORT}`);
});
