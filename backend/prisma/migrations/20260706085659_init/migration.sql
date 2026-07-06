-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vin" TEXT,
    "brand" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "transmission" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "mileage" INTEGER,
    "condition" TEXT,
    "price" REAL,
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
    "purchaseCost" REAL,
    "shippingCost" REAL,
    "customsCost" REAL,
    "maintenanceCost" REAL,
    "otherCosts" REAL,
    "soldPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "whatsappNumber" TEXT,
    "instagramUrl" TEXT,
    "tiktokUrl" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "aboutUsText" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
