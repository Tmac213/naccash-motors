"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all vehicles (Public, for showroom)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vehicles = yield prisma.vehicle.findMany({
            where: {
                status: {
                    not: 'Hidden'
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        // CRITICAL SECURITY: Strip private financial fields before returning public data
        const publicVehicles = vehicles.map(v => {
            const { purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice } = v, safeData = __rest(v, ["purchaseCost", "shippingCost", "customsCost", "maintenanceCost", "otherCosts", "soldPrice"]);
            return safeData;
        });
        res.json(publicVehicles);
    }
    catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
}));
// Get all vehicles including hidden (Admin only)
router.get('/admin', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vehicles = yield prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(vehicles);
    }
    catch (error) {
        console.error('Error fetching admin vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
}));
// Get a single vehicle by ID (Public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const vehicle = yield prisma.vehicle.findUnique({
            where: { id: parseInt(id, 10) }
        });
        if (!vehicle) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        // CRITICAL SECURITY: Strip private financial fields
        const { purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice } = vehicle, safeData = __rest(vehicle, ["purchaseCost", "shippingCost", "customsCost", "maintenanceCost", "otherCosts", "soldPrice"]);
        res.json(safeData);
    }
    catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
}));
// Add a new vehicle (Admin only)
router.post('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vin, brand, year, model, trim, transmission, status, mileage, condition, price, description, image, fuelType, engineCapacity, drivetrain, exteriorColor, interiorColor, bodyType, numberOfOwners, keys, regionalSpecs, sunroof, lighting, specialPackages, techFeatures, purchaseCost, shippingCost, customsCost, maintenanceCost, otherCosts, soldPrice } = req.body;
        const newVehicle = yield prisma.vehicle.create({
            data: {
                vin, brand, model, trim,
                year: parseInt(year, 10),
                transmission, status: status || 'Available',
                mileage: mileage ? parseInt(mileage, 10) : null,
                condition,
                price: price ? parseFloat(price) : null,
                description, image: image || null,
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
    }
    catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({ error: 'Failed to create vehicle' });
    }
}));
// Update a vehicle (Admin only)
router.put('/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Convert string to number if needed for certain fields
        if (updateData.year)
            updateData.year = parseInt(updateData.year, 10);
        if (updateData.mileage)
            updateData.mileage = parseInt(updateData.mileage, 10);
        if (updateData.price)
            updateData.price = parseFloat(updateData.price);
        if (updateData.purchaseCost !== undefined)
            updateData.purchaseCost = updateData.purchaseCost ? parseFloat(updateData.purchaseCost) : null;
        if (updateData.shippingCost !== undefined)
            updateData.shippingCost = updateData.shippingCost ? parseFloat(updateData.shippingCost) : null;
        if (updateData.customsCost !== undefined)
            updateData.customsCost = updateData.customsCost ? parseFloat(updateData.customsCost) : null;
        if (updateData.maintenanceCost !== undefined)
            updateData.maintenanceCost = updateData.maintenanceCost ? parseFloat(updateData.maintenanceCost) : null;
        if (updateData.otherCosts !== undefined)
            updateData.otherCosts = updateData.otherCosts ? parseFloat(updateData.otherCosts) : null;
        if (updateData.soldPrice !== undefined)
            updateData.soldPrice = updateData.soldPrice ? parseFloat(updateData.soldPrice) : null;
        const updatedVehicle = yield prisma.vehicle.update({
            where: { id: parseInt(id, 10) },
            data: updateData
        });
        res.json(updatedVehicle);
    }
    catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ error: 'Failed to update vehicle' });
    }
}));
// Delete a vehicle (Admin only)
router.delete('/:id', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.vehicle.delete({
            where: { id: parseInt(id, 10) }
        });
        res.json({ message: 'Vehicle deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ error: 'Failed to delete vehicle' });
    }
}));
exports.default = router;
