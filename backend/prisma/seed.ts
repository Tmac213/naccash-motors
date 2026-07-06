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
      {
        brand: 'Porsche', model: '911 GT3', year: 2023, price: 215000,
        status: 'Available', condition: 'New', transmission: 'Manual',
        mileage: 0, fuelType: 'Petrol', bodyType: 'Coupe',
        exteriorColor: 'Guards Red', interiorColor: 'Black Leather',
        drivetrain: 'RWD', engineCapacity: '4.0L Flat-6', regionalSpecs: 'European',
        description: 'The legendary Porsche 911 GT3 in its most visceral form. Naturally aspirated flat-six engine, bespoke chassis, and track-focused aerodynamics make this a driver\'s dream.',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80',
      },
      {
        brand: 'Mercedes-Benz', model: 'G63 AMG', year: 2023, price: 210000,
        status: 'Available', condition: 'New', transmission: 'Automatic',
        mileage: 0, fuelType: 'Petrol', bodyType: 'SUV',
        exteriorColor: 'Obsidian Black', interiorColor: 'Nappa Leather Beige',
        drivetrain: '4WD', engineCapacity: '4.0L V8 Biturbo', regionalSpecs: 'Gulf Specs',
        description: 'The iconic G-Wagen fused with AMG performance. 577 HP, legendary off-road capability, and an unmistakable boxy silhouette that commands every road.',
        image: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&q=80',
      },
      {
        brand: 'BMW', model: 'M5 Competition', year: 2022, price: 125000,
        status: 'Available', condition: 'Used', transmission: 'Automatic',
        mileage: 18000, fuelType: 'Petrol', bodyType: 'Sedan',
        exteriorColor: 'Marina Bay Blue', interiorColor: 'Merino Leather Black',
        drivetrain: 'AWD', engineCapacity: '4.4L V8 Biturbo', regionalSpecs: 'European',
        description: 'The definitive super-saloon. 625 HP, 0-100 km/h in 3.3 seconds, and a luxurious interior that makes it perfect for both the track and daily driving.',
        image: 'https://images.unsplash.com/photo-1555353540-64fd1b3bb870?auto=format&fit=crop&q=80',
      },
      {
        brand: 'Audi', model: 'R8 V10 Performance', year: 2022, price: 195000,
        status: 'Coming Soon', condition: 'New', transmission: 'Automatic',
        mileage: 500, fuelType: 'Petrol', bodyType: 'Coupe',
        exteriorColor: 'Kemora Grey', interiorColor: 'Fine Nappa Red/Black',
        drivetrain: 'AWD', engineCapacity: '5.2L V10', regionalSpecs: 'European',
        description: 'The last of the naturally aspirated V10 supercars. A screaming 620 HP engine, Quattro AWD, and mid-engine balance make this a true masterpiece.',
        image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80',
      },
      {
        brand: 'Land Rover', model: 'Range Rover Autobiography', year: 2023, price: 180000,
        status: 'Available', condition: 'New', transmission: 'Automatic',
        mileage: 0, fuelType: 'Petrol', bodyType: 'SUV',
        exteriorColor: 'Santorini Black', interiorColor: 'Ivory Semi-Aniline Leather',
        drivetrain: 'AWD', engineCapacity: '4.4L P530 V8', regionalSpecs: 'Gulf Specs',
        description: 'The pinnacle of British luxury SUVs. Effortless performance, opulent cabin, and unrivalled off-road capability wrapped in a sophisticated design.',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80',
      },
      {
        brand: 'Lamborghini', model: 'Urus Performante', year: 2023, price: 285000,
        status: 'Coming Soon', condition: 'New', transmission: 'Automatic',
        mileage: 0, fuelType: 'Petrol', bodyType: 'SUV',
        exteriorColor: 'Verde Mantis', interiorColor: 'Black Alcantara',
        drivetrain: 'AWD', engineCapacity: '4.0L V8 Biturbo', regionalSpecs: 'European',
        description: 'The world\'s most powerful and fastest production SUV. 666 HP, a 306 km/h top speed, and the soul of a Lamborghini in an everyday super-SUV.',
        image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80',
      },
      {
        brand: 'Ferrari', model: 'Roma Spider', year: 2023, price: 320000,
        status: 'Available', condition: 'New', transmission: 'Automatic',
        mileage: 200, fuelType: 'Petrol', bodyType: 'Convertible',
        exteriorColor: 'Rosso Portofino', interiorColor: 'Cuoio Natural Leather',
        drivetrain: 'RWD', engineCapacity: '3.9L V8 Twin-Turbo', regionalSpecs: 'European',
        description: 'La dolce vita on four wheels. The Roma Spider captures the timeless elegance of 1950s Italy with a retractable hardtop and a 620 HP heart of pure fire.',
        image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80',
      },
      {
        brand: 'Rolls-Royce', model: 'Ghost Black Badge', year: 2022, price: 450000,
        status: 'Reserved', condition: 'Used', transmission: 'Automatic',
        mileage: 8000, fuelType: 'Petrol', bodyType: 'Sedan',
        exteriorColor: 'Diamond Black', interiorColor: 'Obsidian Black Piano Leather',
        drivetrain: 'AWD', engineCapacity: '6.75L V12 Biturbo', regionalSpecs: 'European',
        description: 'The darker, more assertive side of Rolls-Royce. The Ghost Black Badge is handcrafted for those who demand ultimate luxury with a rebellious spirit.',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80',
      },
      {
        brand: 'Bentley', model: 'Continental GT Speed', year: 2022, price: 310000,
        status: 'Available', condition: 'Used', transmission: 'Automatic',
        mileage: 12000, fuelType: 'Petrol', bodyType: 'Coupe',
        exteriorColor: 'Viridian', interiorColor: 'Linen/Brunel Two-Tone',
        drivetrain: 'AWD', engineCapacity: '6.0L W12 Biturbo', regionalSpecs: 'European',
        description: 'The ultimate Grand Tourer. A 659 HP W12 engine, all-wheel steering, and a bespoke interior crafted to the finest British standards — perfection personified.',
        image: 'https://images.unsplash.com/photo-1563720223523-78d2e4f9d843?auto=format&fit=crop&q=80',
      },
      {
        brand: 'McLaren', model: '765LT Spider', year: 2021, price: 395000,
        status: 'Sold Out', condition: 'Used', transmission: 'Automatic',
        mileage: 5500, fuelType: 'Petrol', bodyType: 'Convertible',
        exteriorColor: 'Papaya Spark', interiorColor: 'Carbon Black Alcantara',
        drivetrain: 'RWD', engineCapacity: '4.0L V8 Twin-Turbo', regionalSpecs: 'European',
        description: 'One of only 765 ever made. The McLaren 765LT Spider is the most track-focused, driver-centric and fastest roadster McLaren has ever produced.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80',
      },
    ];

    for (const v of vehicles) {
      await prisma.vehicle.create({ data: v });
    }
    console.log(`Seeded ${vehicles.length} vehicles.`);
  } else {
    console.log(`Skipping vehicle seed — ${count} vehicles already exist.`);
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
