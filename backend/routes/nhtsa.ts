import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// Get All Car Makes (Brands)
router.get('/makes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${NHTSA_BASE_URL}/GetAllMakes?format=json`);
    const data = await response.json();
    
    // We might want to filter or format the results here, but we'll return raw for now.
    res.json(data);
  } catch (error) {
    console.error('Error fetching makes:', error);
    res.status(500).json({ error: 'Failed to fetch car makes' });
  }
});

// Get Models by Make and Year
router.get('/models/:make/:year', authenticateToken, async (req: Request, res: Response) => {
  const { make, year } = req.params;

  try {
    const response = await fetch(`${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Error fetching models for make: ${make}, year: ${year}`, error);
    res.status(500).json({ error: 'Failed to fetch car models' });
  }
});

export default router;
