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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get settings (Public, to display on frontend)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let settings = yield prisma.settings.findUnique({
            where: { id: 1 }
        });
        if (!settings) {
            // Create default settings if not exists
            settings = yield prisma.settings.create({
                data: {
                    whatsappNumber: '',
                    instagramUrl: '',
                    tiktokUrl: ''
                }
            });
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
}));
// Update settings (Admin only)
router.put('/', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { whatsappNumber, instagramUrl, tiktokUrl } = req.body;
        const updatedSettings = yield prisma.settings.upsert({
            where: { id: 1 },
            update: {
                whatsappNumber,
                instagramUrl,
                tiktokUrl
            },
            create: {
                id: 1,
                whatsappNumber,
                instagramUrl,
                tiktokUrl
            }
        });
        res.json(updatedSettings);
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
}));
exports.default = router;
