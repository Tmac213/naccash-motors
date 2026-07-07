-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  whatsappNumber TEXT,
  instagramUrl TEXT,
  tiktokUrl TEXT,
  facebookUrl TEXT,
  email TEXT,
  phoneNumber TEXT,
  address TEXT,
  aboutUsText TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (id, whatsappNumber, instagramUrl, tiktokUrl, email, phoneNumber, address)
VALUES (1, '+96181877675', '', '', 'info@naccashmotors.com', '+961 81 877 675', 'Lebanon')
ON CONFLICT (id) DO NOTHING;

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  vin TEXT,
  brand TEXT NOT NULL,
  year INTEGER NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  transmission TEXT,
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold Out', 'Hidden', 'Coming Soon')),
  mileage INTEGER,
  condition TEXT,
  price DECIMAL(10,2),
  description TEXT,
  image TEXT,
  images TEXT, -- JSON array of image URLs
  videos TEXT, -- JSON array of video URLs
  -- Engine & Performance
  fuelType TEXT,
  engineCapacity TEXT,
  drivetrain TEXT,
  -- Aesthetics & Styling
  exteriorColor TEXT,
  interiorColor TEXT,
  bodyType TEXT,
  -- Ownership & Legal
  numberOfOwners TEXT,
  keys TEXT,
  regionalSpecs TEXT,
  -- Premium Features
  sunroof TEXT,
  lighting TEXT,
  specialPackages TEXT, -- JSON array stored as string
  techFeatures TEXT, -- JSON array stored as string
  -- Accounting & Financials
  purchaseCost DECIMAL(10,2),
  shippingCost DECIMAL(10,2),
  customsCost DECIMAL(10,2),
  maintenanceCost DECIMAL(10,2),
  otherCosts DECIMAL(10,2),
  soldPrice DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policies for settings (public read, admin write)
CREATE POLICY "Settings are publicly viewable" ON settings FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for vehicles (public read non-hidden, admin full access)
CREATE POLICY "Public vehicles are viewable" ON vehicles FOR SELECT USING (status != 'Hidden');
CREATE POLICY "Admin can view all vehicles" ON vehicles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can insert vehicles" ON vehicles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can update vehicles" ON vehicles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete vehicles" ON vehicles FOR DELETE USING (auth.role() = 'authenticated');

-- Note: Sample data is in sample-data.sql to avoid policy conflicts
