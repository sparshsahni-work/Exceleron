// File: backend/routes/files.js
// This file handles the physical file upload process with security fixes.

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import FileUpload from '../models/FileUpload.js';
import { User } from '../models/user.model.js'; 

const router = express.Router();

// --- Multer Configuration for File Storage ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
    }
  }
});

// --- Route for Uploading a Single File ---
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Security Fix: Use req.userId from the verified token.
    const fileUpload = new FileUpload({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadPath: req.file.path,
      uploadedBy: req.userId, // SECURE: Use the ID from the token
    });
    await fileUpload.save();

    // Security Fix: Use req.userId to update the correct user's analytics.
    const user = await User.findById(req.userId);
    if (user) {
      await user.updateAnalytics('filesUploaded');
    }

    res.json({ 
        success: true, 
        message: "File uploaded successfully.",
        file: fileUpload 
    });

  } catch (error) {
    console.error('File upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: 'File processing failed',
      message: error.message 
    });
  }
});

export default router;
