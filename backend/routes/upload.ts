import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

// Ensure uploads directory exists for local fallback
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Dynamic storage engine
let storage: multer.StorageEngine;

const useCloudinary = !!(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);

if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isVideo = file.mimetype.startsWith('video/');
      return {
        folder: 'car-dealer-uploads',
        resource_type: isVideo ? 'video' : 'image',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'heic', 'mp4', 'mov', 'avi', 'mkv', 'webm'],
        public_id: `vehicle-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        // Cloudinary auto-optimizes images
        ...(isVideo ? {} : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }),
      };
    },
  });
} else {
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `vehicle-${uniqueSuffix}${ext}`);
    },
  });
}

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/avi', 'video/x-matroska', 'video/webm', 'video/x-msvideo'];

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: images (jpg, png, webp, heic) and videos (mp4, mov, avi, mkv, webm).`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB max per file (for videos)
    files: 20, // up to 20 files at once
  },
});

// POST /api/upload — Upload one or multiple vehicle images/videos
router.post('/', authenticateToken, (req: Request, res: Response, next: express.NextFunction) => {
  upload.array('media', 20)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'One or more files are too large. Maximum size is 200MB per file.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      // Could be Cloudinary 413 or unsupported file type
      return res.status(413).json({ error: err.message || 'File too large or upload rejected.' });
    }
    next();
  });
}, (req: Request, res: Response): void => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    'http://localhost:5000';


  const urls = files.map(file => {
    let url = '';
    if ((file as any).path && (file as any).path.startsWith('http')) {
      url = (file as any).path; // Cloudinary URL
    } else if ((file as any).secure_url) {
      url = (file as any).secure_url; // Cloudinary secure URL
    } else {
      url = `${API_URL}/uploads/${file.filename}`; // Local absolute URL
    }
    return {
      url,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      originalName: file.originalname,
    };
  });

  res.json({ files: urls });
});

export default router;
