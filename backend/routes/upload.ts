import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.DATABASE_URL?.replace('postgresql://', 'https://').split('@')[0] + '.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Use memory storage for Supabase upload
const storage = multer.memoryStorage();

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
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' });
    return;
  }

  upload.array('media', 20)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'One or more files are too large. Maximum size is 200MB per file.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(413).json({ error: err.message || 'File too large or upload rejected.' });
    }

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const isVideo = file.mimetype.startsWith('video/');
        const folder = isVideo ? 'vehicles/videos' : 'vehicles/images';
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('vehicles')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('vehicles')
          .getPublicUrl(filePath);

        return {
          url: publicUrl,
          type: isVideo ? 'video' : 'image',
          originalName: file.originalname,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      res.json({ files: uploadedFiles });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload files to Supabase' });
    }
  });
});

export default router;
