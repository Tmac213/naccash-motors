export interface BrandData {
  models: string[];
  transmissions: string[];
  yearStart: number;
}

export const CAR_DATA: Record<string, BrandData> = {
  'Alfa Romeo':     { models: ['4C', '4C Spider', 'Giulia', 'Giulia Quadrifoglio', 'GTV', 'Spider', 'Stelvio', 'Stelvio Quadrifoglio', 'Tonale'], transmissions: ['8-Speed Automatic', 'Manual'], yearStart: 2004 },
  'Aston Martin':   { models: ['DB9', 'DB11', 'DB12', 'DBS Superleggera', 'DBX', 'DBX707', 'Rapide', 'Vantage', 'Vantage AMR', 'Virage'], transmissions: ['ZF 8-Speed Automatic', 'Touchtronic 3', 'Manual'], yearStart: 2004 },
  'Audi':           { models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron GT', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'Q8 e-tron', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'TT', 'TT RS', 'TTS'], transmissions: ['S tronic (DCT)', 'Tiptronic', 'Manual'], yearStart: 1995 },
  'Bentley':        { models: ['Bentayga', 'Bentayga EWB', 'Bentayga S', 'Continental GT', 'Continental GT Convertible', 'Continental GT Speed', 'Flying Spur', 'Flying Spur Speed', 'Mulsanne'], transmissions: ['8-Speed ZF Automatic', 'Dual Clutch'], yearStart: 2003 },
  'BMW':            { models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'i3', 'i4', 'iX', 'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'Z4'], transmissions: ['Steptronic', 'M Steptronic DCT', 'Manual'], yearStart: 1990 },
  'Bugatti':        { models: ['Bolide', 'Chiron', 'Chiron Sport', 'Chiron Super Sport', 'Divo', 'Veyron', 'Veyron Super Sport'], transmissions: ['DSG 7-Speed'], yearStart: 2005 },
  'Cadillac':       { models: ['CT4', 'CT4-V Blackwing', 'CT5', 'CT5-V Blackwing', 'Escalade', 'Escalade ESV', 'Lyriq', 'XT4', 'XT5', 'XT6'], transmissions: ['10-Speed Automatic', '8-Speed Automatic'], yearStart: 2000 },
  'Chevrolet':      { models: ['Camaro', 'Camaro ZL1', 'Colorado', 'Corvette', 'Corvette Z06', 'Corvette ZR1', 'Silverado', 'Suburban', 'Tahoe', 'Traverse'], transmissions: ['10-Speed Automatic', '8-Speed Automatic', '7-Speed Manual'], yearStart: 1990 },
  'Dodge':          { models: ['Challenger', 'Challenger Hellcat', 'Challenger Demon', 'Charger', 'Charger Hellcat', 'Durango', 'Viper'], transmissions: ['8-Speed Automatic', '6-Speed Manual'], yearStart: 2000 },
  'Ferrari':        { models: ['296 GTB', '296 GTS', '488 GTB', '488 Pista', '488 Spider', '812 GTS', '812 Superfast', 'F8 Spider', 'F8 Tributo', 'GTC4Lusso', 'Portofino M', 'Purosangue', 'Roma', 'SF90 Spider', 'SF90 Stradale'], transmissions: ['F1 DCT', 'F8 DCT'], yearStart: 2000 },
  'Ford':           { models: ['Bronco', 'Expedition', 'Explorer', 'F-150', 'F-150 Raptor', 'F-150 Raptor R', 'Mustang', 'Mustang GT500', 'Mustang Mach-E'], transmissions: ['10-Speed Automatic', '7-Speed DCT', 'Manual'], yearStart: 1990 },
  'Genesis':        { models: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80', 'GV80 Coupe'], transmissions: ['8-Speed Automatic', '6-Speed Manual'], yearStart: 2016 },
  'Honda':          { models: ['Accord', 'Civic', 'Civic Type R', 'CR-V', 'HR-V', 'NSX', 'Passport', 'Pilot', 'Ridgeline'], transmissions: ['CVT', '6-Speed Manual', '10-Speed Automatic'], yearStart: 1990 },
  'Infiniti':       { models: ['Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX80'], transmissions: ['7-Speed Automatic', '9-Speed CVT'], yearStart: 2000 },
  'Jaguar':         { models: ['E-Pace', 'F-Pace', 'F-Type', 'F-Type R', 'I-Pace', 'XE', 'XF', 'XJ'], transmissions: ['8-Speed Automatic', 'Manual'], yearStart: 2002 },
  'Jeep':           { models: ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee 4xe', 'Grand Cherokee L', 'Renegade', 'Wrangler', 'Wrangler Unlimited'], transmissions: ['8-Speed Automatic', '6-Speed Manual'], yearStart: 1990 },
  'Lamborghini':    { models: ['Aventador', 'Aventador SVJ', 'Huracán', 'Huracán Evo', 'Huracán STO', 'Huracán Tecnica', 'Revuelto', 'Urus', 'Urus Performante', 'Urus S'], transmissions: ['LDF Dual Clutch', 'ISR Sequential', 'Automatic'], yearStart: 2003 },
  'Land Rover':     { models: ['Defender 90', 'Defender 110', 'Defender 130', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'], transmissions: ['8-Speed Automatic', '9-Speed Automatic'], yearStart: 1990 },
  'Lexus':          { models: ['ES', 'GS', 'GX', 'IS', 'IS F', 'LC', 'LC Convertible', 'LS', 'LX', 'NX', 'RC', 'RC F', 'RX', 'UX'], transmissions: ['CVT', '8-Speed Automatic', '10-Speed Automatic'], yearStart: 1990 },
  'Maserati':       { models: ['GranCabrio', 'GranTurismo', 'Grecale', 'Ghibli', 'Levante', 'Levante Trofeo', 'MC20', 'Quattroporte'], transmissions: ['ZF 8-Speed Automatic', 'Manual'], yearStart: 2002 },
  'McLaren':        { models: ['540C', '570GT', '570S', '600LT', '620R', '650S', '720S', '750S', 'Artura', 'Elva', 'GT', 'P1', 'Senna'], transmissions: ['SSG Dual Clutch'], yearStart: 2012 },
  'Mercedes-Benz':  { models: ['A-Class', 'AMG GT', 'AMG GT 4-Door', 'B-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'EQE', 'EQS', 'G-Class', 'GLA', 'GLB', 'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLS', 'S-Class', 'SL', 'SLC', 'V-Class'], transmissions: ['9G-Tronic', '7G-Tronic', 'AMG Speedshift DCT', 'Manual'], yearStart: 1990 },
  'Nissan':         { models: ['370Z', 'Altima', 'Armada', 'GT-R', 'Maxima', 'Navara', 'Patrol', 'Patrol Nismo', 'Z'], transmissions: ['6-Speed DCT', '7-Speed Automatic', 'Manual'], yearStart: 1990 },
  'Porsche':        { models: ['718 Boxster', '718 Boxster GTS', '718 Cayman', '718 Cayman GT4', '911', '911 Carrera', '911 GT3', '911 GT3 RS', '911 Turbo', '911 Turbo S', 'Cayenne', 'Cayenne Coupe', 'Cayenne Turbo', 'Macan', 'Panamera', 'Taycan', 'Taycan Cross Turismo'], transmissions: ['PDK', 'Manual', 'Tiptronic S'], yearStart: 1990 },
  'Rolls-Royce':    { models: ['Cullinan', 'Cullinan Black Badge', 'Dawn', 'Ghost', 'Ghost Extended', 'Phantom', 'Phantom Extended', 'Spectre', 'Wraith', 'Wraith Black Badge'], transmissions: ['8-Speed ZF Automatic'], yearStart: 2003 },
  'Tesla':          { models: ['Cybertruck', 'Model 3', 'Model S', 'Model S Plaid', 'Model X', 'Model Y', 'Roadster'], transmissions: ['Single Speed Direct Drive'], yearStart: 2012 },
  'Toyota':         { models: ['Camry', 'Corolla', 'GR86', 'GR Corolla', 'GR Supra', 'Highlander', 'Land Cruiser', 'Land Cruiser 70', 'Land Cruiser 300', 'Prius', 'RAV4', 'Sequoia', 'Tundra'], transmissions: ['8-Speed Automatic', 'CVT', '6-Speed Manual'], yearStart: 1990 },
  'Volkswagen':     { models: ['Arteon', 'Golf', 'Golf GTI', 'Golf R', 'ID.4', 'Passat', 'Tiguan', 'Touareg', 'Touareg R'], transmissions: ['DSG', 'Manual', '8-Speed Automatic'], yearStart: 1990 },
};

export const BRANDS = Object.keys(CAR_DATA).sort();

export function getModels(brand: string): string[] {
  return CAR_DATA[brand]?.models || [];
}

export function getYears(brand: string): number[] {
  const start = CAR_DATA[brand]?.yearStart || 1990;
  const currentYear = new Date().getFullYear() + 1;
  return Array.from({ length: currentYear - start + 1 }, (_, i) => currentYear - i);
}

export const FUEL_TYPES = [
  'Gasoline (Benzine)',
  'Diesel',
  'Hybrid',
  'Electric (EV)',
  'Plug-in Hybrid (PHEV)',
  'Mild Hybrid (MHEV)',
];

export const DRIVETRAINS = [
  'Rear-Wheel Drive (RWD)',
  'Front-Wheel Drive (FWD)',
  'All-Wheel Drive (AWD)',
  '4x4 / 4WD',
];

export const TRANSMISSIONS = [
  'Automatic',
  'Manual',
  'CVT',
  'Dual-Clutch (DCT)',
  'Tiptronic',
];

export const ENGINE_CAPACITIES = [
  '1.0L', '1.2L', '1.4L', '1.5L', '1.6L', '1.8L', 
  '2.0L', '2.2L', '2.4L', '2.5L', '2.8L', '2.9L',
  '3.0L', '3.5L', '3.6L', '3.8L',
  '4.0L', '4.4L', '4.8L', 
  '5.0L', '5.2L', '5.5L', '5.8L', 
  '6.0L', '6.2L', '6.5L',
  'Electric (EV)',
  '4-Cylinder',
  '6-Cylinder',
  'V6',
  'V8',
  'V10',
  'V12',
];

export const EXTERIOR_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray / Graphite',
  'Blue',
  'Red',
  'Yellow',
  'Orange',
  'Green',
  'Brown / Beige',
  'Purple',
  'Carbon / Charcoal',
  'Gold',
  'Custom / Wrap',
  'Other',
];

export const INTERIOR_COLORS = [
  'Black Leather',
  'Beige / Cream Leather',
  'Red Leather',
  'Brown Leather',
  'Gray Leather',
  'White Leather',
  'Alcantara (Black)',
  'Alcantara (Red)',
  'Two-Tone Leather',
  'Cloth / Fabric',
  'Carbon Fiber Trim',
  'Other',
];

export const BODY_TYPES = [
  'Sedan',
  'Coupe',
  'SUV',
  'Convertible / Cabriolet',
  'Hatchback',
  'Wagon / Estate',
  'Pickup Truck',
  'Van / Minivan',
  'Supercar',
  'Hypercar',
];

export const OWNER_OPTIONS = ['1st Owner', '2nd Owner', '3rd+ Owners'];

export const KEY_OPTIONS = ['1 Key', '2 Keys', '3 Keys'];

export const REGIONAL_SPECS = [
  'European Specs',
  'Gulf (GCC) Specs',
  'US Specs',
  'Japanese Import',
  'Korean Specs',
  'Other',
];

export const SUNROOF_OPTIONS = ['None', 'Sunroof', 'Moonroof', 'Panoramic Roof'];

export const LIGHTING_OPTIONS = [
  'Standard Halogen',
  'LED',
  'Xenon / Bi-Xenon (HID)',
  'Laser Lights',
  'Matrix LED',
  'Adaptive LED',
];

export const TECH_FEATURES = [
  'Apple CarPlay / Android Auto',
  'Rear View Camera',
  '360° Surround Camera',
  'Front Parking Sensors',
  'Rear Parking Sensors',
  'Head-Up Display (HUD)',
  'Premium Sound (Harman Kardon)',
  'Premium Sound (Bose)',
  'Premium Sound (Bang & Olufsen)',
  'Premium Sound (Burmester)',
  'Lane Departure Warning',
  'Blind Spot Monitor',
  'Adaptive Cruise Control',
  'Massage Seats',
  'Ventilated Seats',
  'Heated Seats',
  'Power Folding Mirrors',
  'Keyless Entry / Push Start',
  'Wireless Charging',
  'Night Vision',
];

export const SPECIAL_PACKAGES: Record<string, string[]> = {
  'BMW': ['M Sport Package', 'M Performance Package', 'Individual', 'Carbon Fiber Package'],
  'Mercedes-Benz': ['AMG Line', 'Night Package', 'AMG Aerodynamics', 'Designo Package'],
  'Audi': ['S-Line', 'Black Edition', 'Audi Sport', 'RS Package'],
  'Porsche': ['Sport Chrono', 'PCCB (Ceramic Brakes)', 'Clubsport Package', 'Weissach Package', 'Lightweight Package'],
  'Land Rover': ['Black Pack', 'HSE', 'HST', 'Autobiography', 'SV Autobiography'],
  'default': ['Sports Package', 'Luxury Package', 'Technology Package', 'Premium Package', 'Black Edition'],
};

export function getSpecialPackages(brand: string): string[] {
  return SPECIAL_PACKAGES[brand] || SPECIAL_PACKAGES['default'];
}
