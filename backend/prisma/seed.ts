import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cardealer.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@cardealer.com',
      password: hashedPassword,
    },
  });

  console.log('Admin user created/verified:', admin.email);

  // Seed sample vehicles if none exist
  const count = await prisma.vehicle.count();
  if (count === 0) {
    const vehicles = [
      { brand: 'Porsche', model: '911 GT3', year: 2023, price: 215000, status: 'Available', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80', transmission: 'Automatic', condition: 'New' },
      { brand: 'Mercedes-Benz', model: 'G63 AMG', year: 2022, price: 185000, status: 'Reserved', image: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&q=80', transmission: 'Automatic', condition: 'Used' },
      { brand: 'BMW', model: 'M5 Competition', year: 2021, price: 125000, status: 'Sold Out', image: 'https://images.unsplash.com/photo-1555353540-64fd1b3bb870?auto=format&fit=crop&q=80', transmission: 'Automatic', condition: 'Used' },
      { brand: 'Audi', model: 'R8 V10 Performance', year: 2022, price: 195000, status: 'Available', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80', transmission: 'Automatic', condition: 'New' }
    ];

    for (const v of vehicles) {
      await prisma.vehicle.create({ data: v });
    }
    console.log(`Seeded ${vehicles.length} vehicles.`);
  }

  // Seed settings
  const settingsCount = await prisma.settings.count();
  if (settingsCount === 0) {
    await prisma.settings.create({
      data: {
        whatsappNumber: '+1234567890',
        instagramUrl: 'https://instagram.com/cardealer',
        tiktokUrl: 'https://tiktok.com/@cardealer'
      }
    });
    console.log('Seeded initial settings.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
