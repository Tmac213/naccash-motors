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
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
// Get All Car Makes (Brands)
router.get('/makes', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`${NHTSA_BASE_URL}/GetAllMakes?format=json`);
        const data = yield response.json();
        // We might want to filter or format the results here, but we'll return raw for now.
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching makes:', error);
        res.status(500).json({ error: 'Failed to fetch car makes' });
    }
}));
// Get Models by Make and Year
router.get('/models/:make/:year', authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { make, year } = req.params;
    try {
        const response = yield fetch(`${NHTSA_BASE_URL}/GetModelsForMakeYear/make/${make}/modelyear/${year}?format=json`);
        const data = yield response.json();
        res.json(data);
    }
    catch (error) {
        console.error(`Error fetching models for make: ${make}, year: ${year}`, error);
        res.status(500).json({ error: 'Failed to fetch car models' });
    }
}));
exports.default = router;
