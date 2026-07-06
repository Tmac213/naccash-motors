import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import * as functions from 'firebase-functions';
import authRoutes from './routes/auth';
import nhtsaRoutes from './routes/nhtsa';
import inventoryRoutes from './routes/inventory';
import settingsRoutes from './routes/settings';
import uploadRoutes from './routes/upload';
import contactRoutes from './routes/contact';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded images statically
// Handle both ts-node (development) and compiled builds (production)
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/nhtsa', nhtsaRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Naccash Motors API is running');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Run local server when not deployed to Firebase
const isFirebase = process.env.FUNCTIONS_EMULATOR === 'true' || process.env.K_SERVICE;
if (!isFirebase) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export as Firebase HTTP Function
export const api = functions.https.onRequest(app);
