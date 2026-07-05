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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create admin user
        const hashedPassword = yield bcrypt_1.default.hash('admin123', 10);
        const admin = yield prisma.user.upsert({
            where: { email: 'admin@cardealer.com' },
            update: {},
            create: {
                email: 'admin@cardealer.com',
                password: hashedPassword,
            },
        });
        console.log('Admin user created/verified:', admin.email);
        // Seed sample vehicles if none exist
        const count = yield prisma.vehicle.count();
        if (count === 0) {
            const vehicles = [
                { brand: 'Porsche', model: '911 GT3', year: 2023, price: 215000, status: 'Available', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80', transmission: 'Automatic', condition: 'New' },
                { brand: 'Mercedes-Benz', model: 'G63 AMG', year: 2022, price: 185000, status: 'Reserved', image: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&q=80', transmission: 'Automatic', condition: 'Used' },
                { brand: 'BMW', model: 'M5 Competition', year: 2021, price: 125000, status: 'Sold Out', image: 'https://images.unsplash.com/photo-1555353540-64fd1b3bb870?auto=format&fit=crop&q=80', transmission: 'Automatic', condition: 'Used' },
                { brand: 'Audi', model: 'R8 V10 Performance', year: 2022, price: 195000, status: 'Available', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80', transmission: 'Automatic', condition: 'New' }
            ];
            for (const v of vehicles) {
                yield prisma.vehicle.create({ data: v });
            }
            console.log(`Seeded ${vehicles.length} vehicles.`);
        }
        // Seed settings
        const settingsCount = yield prisma.settings.count();
        if (settingsCount === 0) {
            yield prisma.settings.create({
                data: {
                    whatsappNumber: '+1234567890',
                    instagramUrl: 'https://instagram.com/cardealer',
                    tiktokUrl: 'https://tiktok.com/@cardealer'
                }
            });
            console.log('Seeded initial settings.');
        }
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
