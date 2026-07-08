import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get settings (Public, to display on frontend)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.settings.create({
        data: {
          whatsappNumber: '',
          instagramUrl: '',
          tiktokUrl: '',
          facebookUrl: ''
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (Admin only)
router.put('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { whatsappNumber, instagramUrl, tiktokUrl, facebookUrl, email, phoneNumber, address, aboutUsText } = req.body;

    const updatedSettings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        whatsappNumber,
        instagramUrl,
        tiktokUrl,
        facebookUrl,
        email,
        phoneNumber,
        address,
        aboutUsText
      },
      create: {
        id: 1,
        whatsappNumber,
        instagramUrl,
        tiktokUrl,
        facebookUrl,
        email,
        phoneNumber,
        address,
        aboutUsText
      }
    });

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
