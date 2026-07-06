import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Helper: parse JSON string fields into proper arrays before sending to client
function parseVehicle(v: any) {
  const tryParse = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };
  return {
    ...v,
    images: tryParse(v.images),
    videos: tryParse(v.videos),
    specialPackages: tryParse(v.specialPackages),
    techFeatures: tryParse(v.techFeatures),
  };
}

// Get all vehicles (Public, for showroom)
router.get('/', async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: {
          not: 'Hidden'
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // CRITICAL SECURITY: Strip private financial fields before returning public data
    const publicVehicles = vehicles.map(v => {
      const { purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice, ...safeData } = v;
      return parseVehicle(safeData);
    });

    res.json(publicVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get all vehicles including hidden (Admin only)
router.get('/admin', authenticateToken, async (req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(vehicles.map(parseVehicle));
  } catch (error) {
    console.error('Error fetching admin vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get a single vehicle by ID (Public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(id as string, 10) }
    });

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    
    // CRITICAL SECURITY: Strip private financial fields
    const { purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice, ...safeData } = vehicle;

    res.json(parseVehicle(safeData));
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Add a new vehicle (Admin only)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      vin, brand, year, model, trim, transmission, status, mileage, condition, price, description, image,
      images, videos,
      fuelType, engineCapacity, drivetrain, exteriorColor, interiorColor, bodyType,
      numberOfOwners, keys, regionalSpecs, sunroof, lighting, specialPackages, techFeatures,
      purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice
    } = req.body;
    
    const newVehicle = await prisma.vehicle.create({
      data: {
        vin, brand, model, trim,
        year: parseInt(year, 10),
        transmission, status: status || 'Available',
        mileage: mileage ? parseInt(mileage, 10) : null,
        condition,
        price: price ? parseFloat(price) : null,
        description, image: image || null,
        images: Array.isArray(images) ? JSON.stringify(images) : (images || null),
        videos: Array.isArray(videos) ? JSON.stringify(videos) : (videos || null),
        fuelType, engineCapacity, drivetrain,
        exteriorColor, interiorColor, bodyType,
        numberOfOwners, keys, regionalSpecs,
        sunroof, lighting,
        specialPackages: Array.isArray(specialPackages) ? JSON.stringify(specialPackages) : (specialPackages || null),
        techFeatures: Array.isArray(techFeatures) ? JSON.stringify(techFeatures) : (techFeatures || null),
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
        shippingCost: shippingCost ? parseFloat(shippingCost) : null,
        customsCost: customsCost ? parseFloat(customsCost) : null,
        maintenanceCost: maintenanceCost ? parseFloat(maintenanceCost) : null,
        otherCosts: otherCosts ? parseFloat(otherCosts) : null,
        soldPrice: soldPrice ? parseFloat(soldPrice) : null,
      }
    });

    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// Update a vehicle (Admin only)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert string to number if needed for certain fields
    if (updateData.year !== undefined) updateData.year = updateData.year ? parseInt(updateData.year, 10) : null;
    if (updateData.mileage !== undefined) updateData.mileage = updateData.mileage ? parseInt(updateData.mileage, 10) : null;
    if (updateData.price !== undefined) updateData.price = updateData.price ? parseFloat(updateData.price) : null;
    
    if (updateData.purchaseCost !== undefined) updateData.purchaseCost = updateData.purchaseCost ? parseFloat(updateData.purchaseCost) : null;
    if (updateData.shippingCost !== undefined) updateData.shippingCost = updateData.shippingCost ? parseFloat(updateData.shippingCost) : null;
    if (updateData.customsCost !== undefined) updateData.customsCost = updateData.customsCost ? parseFloat(updateData.customsCost) : null;
    if (updateData.maintenanceCost !== undefined) updateData.maintenanceCost = updateData.maintenanceCost ? parseFloat(updateData.maintenanceCost) : null;
    if (updateData.otherCosts !== undefined) updateData.otherCosts = updateData.otherCosts ? parseFloat(updateData.otherCosts) : null;
    if (updateData.soldPrice !== undefined) updateData.soldPrice = updateData.soldPrice ? parseFloat(updateData.soldPrice) : null;

    // Serialize array fields back to JSON strings for DB storage
    if (updateData.images !== undefined) updateData.images = Array.isArray(updateData.images) ? JSON.stringify(updateData.images) : (updateData.images || null);
    if (updateData.videos !== undefined) updateData.videos = Array.isArray(updateData.videos) ? JSON.stringify(updateData.videos) : (updateData.videos || null);
    if (updateData.specialPackages !== undefined) updateData.specialPackages = Array.isArray(updateData.specialPackages) ? JSON.stringify(updateData.specialPackages) : (updateData.specialPackages || null);
    if (updateData.techFeatures !== undefined) updateData.techFeatures = Array.isArray(updateData.techFeatures) ? JSON.stringify(updateData.techFeatures) : (updateData.techFeatures || null);

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: parseInt(id as string, 10) },
      data: updateData
    });

    res.json(parseVehicle(updatedVehicle));
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete a vehicle (Admin only)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({
      where: { id: parseInt(id as string, 10) }
    });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
