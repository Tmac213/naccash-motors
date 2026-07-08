-- Reset legacy lowercase tables and apply Prisma schema
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS "Vehicle" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "vin" TEXT,
    "brand" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "transmission" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "mileage" INTEGER,
    "condition" TEXT,
    "price" DOUBLE PRECISION,
    "description" TEXT,
    "image" TEXT,
    "images" TEXT,
    "videos" TEXT,
    "fuelType" TEXT,
    "engineCapacity" TEXT,
    "drivetrain" TEXT,
    "exteriorColor" TEXT,
    "interiorColor" TEXT,
    "bodyType" TEXT,
    "numberOfOwners" TEXT,
    "keys" TEXT,
    "regionalSpecs" TEXT,
    "sunroof" TEXT,
    "lighting" TEXT,
    "specialPackages" TEXT,
    "techFeatures" TEXT,
    "purchaseCost" DOUBLE PRECISION,
    "shippingCost" DOUBLE PRECISION,
    "customsCost" DOUBLE PRECISION,
    "maintenanceCost" DOUBLE PRECISION,
    "otherCosts" DOUBLE PRECISION,
    "soldPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "whatsappNumber" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "aboutUsText" TEXT,
    "facebookUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

INSERT INTO "Settings" ("id", "whatsappNumber", "instagramUrl", "tiktokUrl", "updatedAt")
VALUES (1, '+1234567890', 'https://instagram.com/cardealer', 'https://tiktok.com/@cardealer', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
