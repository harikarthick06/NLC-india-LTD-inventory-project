const categories = [
  { name: 'Bearings', description: 'Ball, roller and thrust bearings for rotating machinery' },
  { name: 'Safety Equipment', description: 'Personal protective equipment (PPE) for plant and field staff' },
  { name: 'Electrical Components', description: 'Switches, contactors, relays and control gear' },
  { name: 'Motors & Drives', description: 'Induction motors, drives and motor spares' },
  { name: 'Fasteners', description: 'Bolts, nuts, washers and other fastening hardware' },
  { name: 'Pipes & Valves', description: 'Piping, fittings and industrial valves' },
  { name: 'Lubricants & Consumables', description: 'Greases, oils and maintenance consumables' },
  { name: 'Cables & Wiring', description: 'Power and control cables' },
  { name: 'Filters', description: 'Air, oil and hydraulic filters' },
  { name: 'Tools', description: 'Hand tools and power tools for maintenance crews' },
];

const suppliers = [
  {
    name: 'SKF India Ltd',
    contactPerson: 'Rajesh Menon',
    email: 'sales@skfindia.example',
    phone: '+91-44-28271000',
    address: 'Guindy Industrial Estate, Chennai, Tamil Nadu',
    gstNumber: '33AAACS1234F1Z5',
  },
  {
    name: 'ABC Industries',
    contactPerson: 'Suresh Kumar',
    email: 'contact@abcindustries.example',
    phone: '+91-422-4567890',
    address: 'SIDCO Industrial Estate, Coimbatore, Tamil Nadu',
    gstNumber: '33AABCA5678K1Z2',
  },
  {
    name: 'Havells India Ltd',
    contactPerson: 'Priya Sharma',
    email: 'b2b@havells.example',
    phone: '+91-124-3931234',
    address: 'QRG Towers, Sector 126, Noida, Uttar Pradesh',
    gstNumber: '09AAACH9012L1Z8',
  },
  {
    name: 'Polycab Wires Pvt Ltd',
    contactPerson: 'Anand Verma',
    email: 'industrial@polycab.example',
    phone: '+91-22-61154200',
    address: 'Halol Industrial Estate, Halol, Gujarat',
    gstNumber: '24AAACP3456M1Z6',
  },
  {
    name: 'Honeywell Safety Products',
    contactPerson: 'Deepa Nair',
    email: 'safety.orders@honeywell.example',
    phone: '+91-80-67189000',
    address: 'Whitefield, Bengaluru, Karnataka',
    gstNumber: '29AAACH7890N1Z1',
  },
  {
    name: 'Elgi Equipments Ltd',
    contactPerson: 'Karthik Raman',
    email: 'sales@elgi.example',
    phone: '+91-422-2589000',
    address: 'Trichy Road, Coimbatore, Tamil Nadu',
    gstNumber: '33AAACE2345P1Z9',
  },
  {
    name: 'Finolex Cables Ltd',
    contactPerson: 'Meena Iyer',
    email: 'orders@finolex.example',
    phone: '+91-20-30514000',
    address: 'Ruby House, Pune, Maharashtra',
    gstNumber: '27AAACF6789Q1Z3',
  },
  {
    name: 'Larsen & Toubro Ltd',
    contactPerson: 'Vikram Singh',
    email: 'procurement@lnt.example',
    phone: '+91-44-22345678',
    address: 'Manapakkam, Chennai, Tamil Nadu',
    gstNumber: '33AAACL0123R1Z4',
  },
];

const locations = [
  { name: 'Warehouse A', description: 'Primary bulk storage for mechanical spares', address: 'NLC Neyveli Complex - Block A' },
  { name: 'Warehouse B', description: 'Bulk storage for electrical and cable stock', address: 'NLC Neyveli Complex - Block B' },
  { name: 'Storage Room 1', description: 'Safety equipment and PPE store', address: 'NLC Neyveli Complex - Admin Building' },
  { name: 'Storage Room 2', description: 'Fasteners and small hardware store', address: 'NLC Neyveli Complex - Workshop Wing' },
  { name: 'Central Store', description: 'Central issue counter for maintenance crews', address: 'NLC Neyveli Complex - Central Yard' },
  { name: 'Maintenance Yard', description: 'Open yard storage for pipes and heavy items', address: 'NLC Neyveli Complex - Yard 2' },
];

const users = [
  { name: 'Arun Prakash', email: 'admin@nlcindia.example', password: 'Admin@123', role: 'admin' },
  { name: 'Lakshmi Narayanan', email: 'manager@nlcindia.example', password: 'Manager@123', role: 'manager' },
  { name: 'Ravi Shankar', email: 'staff@nlcindia.example', password: 'Staff@123', role: 'staff' },
];

// unitPrice in INR. quantity/minStockLevel/maxStockLevel chosen so the seeded data
// naturally produces a mix of in_stock / low_stock / out_of_stock / overstock products.
const products = [
  { sku: 'NLC-BRG-001', name: 'Deep Groove Ball Bearing 6205', category: 'Bearings', brand: 'SKF', supplier: 'SKF India Ltd', location: 'Warehouse A', quantity: 150, minStockLevel: 40, maxStockLevel: 300, unit: 'pcs', unitPrice: 285, subcategory: 'Ball Bearings' },
  { sku: 'NLC-BRG-002', name: 'Spherical Roller Bearing 22218', category: 'Bearings', brand: 'SKF', supplier: 'SKF India Ltd', location: 'Warehouse A', quantity: 12, minStockLevel: 15, maxStockLevel: 100, unit: 'pcs', unitPrice: 4250, subcategory: 'Roller Bearings' },
  { sku: 'NLC-BRG-003', name: 'Thrust Ball Bearing 51305', category: 'Bearings', brand: 'FAG', supplier: 'SKF India Ltd', location: 'Warehouse A', quantity: 0, minStockLevel: 10, maxStockLevel: 80, unit: 'pcs', unitPrice: 610, subcategory: 'Thrust Bearings' },
  { sku: 'NLC-BRG-004', name: 'Tapered Roller Bearing 30208', category: 'Bearings', brand: 'NBC', supplier: 'ABC Industries', location: 'Warehouse A', quantity: 65, minStockLevel: 20, maxStockLevel: 120, unit: 'pcs', unitPrice: 890, subcategory: 'Roller Bearings' },
  { sku: 'NLC-BRG-005', name: 'Pillow Block Bearing UCP 205', category: 'Bearings', brand: 'SKF', supplier: 'SKF India Ltd', location: 'Warehouse A', quantity: 540, minStockLevel: 30, maxStockLevel: 250, unit: 'pcs', unitPrice: 720, subcategory: 'Housed Bearings' },

  { sku: 'NLC-SFT-001', name: 'Industrial Safety Helmet Class A', category: 'Safety Equipment', brand: 'Honeywell', supplier: 'Honeywell Safety Products', location: 'Storage Room 1', quantity: 320, minStockLevel: 100, maxStockLevel: 500, unit: 'pcs', unitPrice: 245, subcategory: 'Head Protection' },
  { sku: 'NLC-SFT-002', name: 'Cut-Resistant Industrial Gloves', category: 'Safety Equipment', brand: '3M', supplier: 'Honeywell Safety Products', location: 'Storage Room 1', quantity: 45, minStockLevel: 80, maxStockLevel: 400, unit: 'pair', unitPrice: 180, subcategory: 'Hand Protection' },
  { sku: 'NLC-SFT-003', name: 'Steel Toe Safety Shoes', category: 'Safety Equipment', brand: 'Bata Industrials', supplier: 'Honeywell Safety Products', location: 'Storage Room 1', quantity: 88, minStockLevel: 50, maxStockLevel: 300, unit: 'pair', unitPrice: 1450, subcategory: 'Foot Protection' },
  { sku: 'NLC-SFT-004', name: 'Full Body Safety Harness', category: 'Safety Equipment', brand: 'Honeywell', supplier: 'Honeywell Safety Products', location: 'Storage Room 1', quantity: 0, minStockLevel: 15, maxStockLevel: 80, unit: 'pcs', unitPrice: 3200, subcategory: 'Fall Protection' },
  { sku: 'NLC-SFT-005', name: 'Safety Goggles Anti-Fog', category: 'Safety Equipment', brand: '3M', supplier: 'Honeywell Safety Products', location: 'Storage Room 1', quantity: 210, minStockLevel: 60, maxStockLevel: 350, unit: 'pcs', unitPrice: 120, subcategory: 'Eye Protection' },
  { sku: 'NLC-SFT-006', name: 'Reflective Safety Vest', category: 'Safety Equipment', brand: 'Honeywell', supplier: 'Honeywell Safety Products', location: 'Storage Room 1', quantity: 175, minStockLevel: 50, maxStockLevel: 300, unit: 'pcs', unitPrice: 210, subcategory: 'Visibility Gear' },

  { sku: 'NLC-ELC-001', name: 'MCB Switch 32A Single Pole', category: 'Electrical Components', brand: 'Havells', supplier: 'Havells India Ltd', location: 'Warehouse B', quantity: 260, minStockLevel: 80, maxStockLevel: 400, unit: 'pcs', unitPrice: 145, subcategory: 'Circuit Protection' },
  { sku: 'NLC-ELC-002', name: 'Industrial Contactor 40A 3-Pole', category: 'Electrical Components', brand: 'Siemens', supplier: 'Havells India Ltd', location: 'Warehouse B', quantity: 18, minStockLevel: 20, maxStockLevel: 100, unit: 'pcs', unitPrice: 2150, subcategory: 'Switchgear' },
  { sku: 'NLC-ELC-003', name: 'Rotary Isolator Switch 63A', category: 'Electrical Components', brand: 'Havells', supplier: 'Havells India Ltd', location: 'Warehouse B', quantity: 72, minStockLevel: 25, maxStockLevel: 150, unit: 'pcs', unitPrice: 980, subcategory: 'Switchgear' },
  { sku: 'NLC-ELC-004', name: 'Control Relay 24V DC 4-Pole', category: 'Electrical Components', brand: 'Schneider Electric', supplier: 'Havells India Ltd', location: 'Warehouse B', quantity: 300, minStockLevel: 60, maxStockLevel: 250, unit: 'pcs', unitPrice: 340, subcategory: 'Control Gear' },
  { sku: 'NLC-ELC-005', name: 'Push Button Station 3-Way', category: 'Electrical Components', brand: 'Havells', supplier: 'Havells India Ltd', location: 'Warehouse B', quantity: 5, minStockLevel: 20, maxStockLevel: 120, unit: 'pcs', unitPrice: 560, subcategory: 'Control Gear' },

  { sku: 'NLC-MTR-001', name: '3-Phase Induction Motor 5HP', category: 'Motors & Drives', brand: 'Kirloskar', supplier: 'Larsen & Toubro Ltd', location: 'Warehouse A', quantity: 22, minStockLevel: 10, maxStockLevel: 60, unit: 'pcs', unitPrice: 18500, subcategory: 'Induction Motors' },
  { sku: 'NLC-MTR-002', name: '3-Phase Induction Motor 20HP', category: 'Motors & Drives', brand: 'Kirloskar', supplier: 'Larsen & Toubro Ltd', location: 'Warehouse A', quantity: 6, minStockLevel: 8, maxStockLevel: 40, unit: 'pcs', unitPrice: 62000, subcategory: 'Induction Motors' },
  { sku: 'NLC-MTR-003', name: 'Variable Frequency Drive 15kW', category: 'Motors & Drives', brand: 'ABB', supplier: 'Larsen & Toubro Ltd', location: 'Warehouse A', quantity: 14, minStockLevel: 8, maxStockLevel: 50, unit: 'pcs', unitPrice: 41500, subcategory: 'Drives' },
  { sku: 'NLC-MTR-004', name: 'Motor Starter DOL 10HP', category: 'Motors & Drives', brand: 'Siemens', supplier: 'Larsen & Toubro Ltd', location: 'Warehouse A', quantity: 35, minStockLevel: 15, maxStockLevel: 90, unit: 'pcs', unitPrice: 3200, subcategory: 'Starters' },

  { sku: 'NLC-FST-001', name: 'Hex Bolt M12x50 Grade 8.8', category: 'Fasteners', brand: 'Unbrako', supplier: 'ABC Industries', location: 'Storage Room 2', quantity: 4200, minStockLevel: 1000, maxStockLevel: 5000, unit: 'pcs', unitPrice: 8, subcategory: 'Bolts' },
  { sku: 'NLC-FST-002', name: 'Hex Nut M12 Stainless Steel', category: 'Fasteners', brand: 'Unbrako', supplier: 'ABC Industries', location: 'Storage Room 2', quantity: 5600, minStockLevel: 1200, maxStockLevel: 5000, unit: 'pcs', unitPrice: 4, subcategory: 'Nuts' },
  { sku: 'NLC-FST-003', name: 'Flat Washer M12 Zinc Plated', category: 'Fasteners', brand: 'Unbrako', supplier: 'ABC Industries', location: 'Storage Room 2', quantity: 850, minStockLevel: 1000, maxStockLevel: 6000, unit: 'pcs', unitPrice: 2, subcategory: 'Washers' },
  { sku: 'NLC-FST-004', name: 'Foundation Anchor Bolt M20x300', category: 'Fasteners', brand: 'Hilti', supplier: 'ABC Industries', location: 'Storage Room 2', quantity: 180, minStockLevel: 60, maxStockLevel: 400, unit: 'pcs', unitPrice: 145, subcategory: 'Bolts' },

  { sku: 'NLC-PPV-001', name: 'MS Pipe 4 inch Schedule 40', category: 'Pipes & Valves', brand: 'Tata Pipes', supplier: 'Larsen & Toubro Ltd', location: 'Maintenance Yard', quantity: 320, minStockLevel: 100, maxStockLevel: 600, unit: 'meter', unitPrice: 620, subcategory: 'Piping' },
  { sku: 'NLC-PPV-002', name: 'Gate Valve 6 inch Cast Iron', category: 'Pipes & Valves', brand: 'Kirloskar', supplier: 'Larsen & Toubro Ltd', location: 'Maintenance Yard', quantity: 9, minStockLevel: 10, maxStockLevel: 60, unit: 'pcs', unitPrice: 8500, subcategory: 'Valves' },
  { sku: 'NLC-PPV-003', name: 'Ball Valve 2 inch Stainless Steel', category: 'Pipes & Valves', brand: 'Audco', supplier: 'Larsen & Toubro Ltd', location: 'Maintenance Yard', quantity: 48, minStockLevel: 20, maxStockLevel: 150, unit: 'pcs', unitPrice: 2650, subcategory: 'Valves' },
  { sku: 'NLC-PPV-004', name: 'Butterfly Valve 8 inch', category: 'Pipes & Valves', brand: 'Audco', supplier: 'Larsen & Toubro Ltd', location: 'Maintenance Yard', quantity: 0, minStockLevel: 8, maxStockLevel: 40, unit: 'pcs', unitPrice: 12500, subcategory: 'Valves' },

  { sku: 'NLC-LUB-001', name: 'Multipurpose Grease NLGI-2', category: 'Lubricants & Consumables', brand: 'Servo', supplier: 'Elgi Equipments Ltd', location: 'Warehouse A', quantity: 145, minStockLevel: 40, maxStockLevel: 250, unit: 'kg', unitPrice: 310, subcategory: 'Grease' },
  { sku: 'NLC-LUB-002', name: 'Industrial Gear Oil EP-320', category: 'Lubricants & Consumables', brand: 'Servo', supplier: 'Elgi Equipments Ltd', location: 'Warehouse A', quantity: 90, minStockLevel: 30, maxStockLevel: 200, unit: 'litre', unitPrice: 265, subcategory: 'Oils' },
  { sku: 'NLC-LUB-003', name: 'Hydraulic Oil ISO VG 68', category: 'Lubricants & Consumables', brand: 'Servo', supplier: 'Elgi Equipments Ltd', location: 'Warehouse A', quantity: 15, minStockLevel: 25, maxStockLevel: 180, unit: 'litre', unitPrice: 245, subcategory: 'Oils' },
  { sku: 'NLC-LUB-004', name: 'Cotton Cleaning Waste', category: 'Lubricants & Consumables', brand: 'Generic', supplier: 'ABC Industries', location: 'Warehouse A', quantity: 620, minStockLevel: 100, maxStockLevel: 500, unit: 'kg', unitPrice: 45, subcategory: 'Consumables' },

  { sku: 'NLC-CBL-001', name: 'XLPE Power Cable 3.5C x 95 sqmm', category: 'Cables & Wiring', brand: 'Polycab', supplier: 'Polycab Wires Pvt Ltd', location: 'Warehouse B', quantity: 850, minStockLevel: 200, maxStockLevel: 1500, unit: 'meter', unitPrice: 1250, subcategory: 'Power Cables' },
  { sku: 'NLC-CBL-002', name: 'Control Cable 1.5 sqmm 12 Core', category: 'Cables & Wiring', brand: 'Polycab', supplier: 'Polycab Wires Pvt Ltd', location: 'Warehouse B', quantity: 60, minStockLevel: 80, maxStockLevel: 600, unit: 'meter', unitPrice: 95, subcategory: 'Control Cables' },
  { sku: 'NLC-CBL-003', name: 'Armoured Cable 4C x 25 sqmm', category: 'Cables & Wiring', brand: 'Finolex', supplier: 'Finolex Cables Ltd', location: 'Warehouse B', quantity: 410, minStockLevel: 100, maxStockLevel: 800, unit: 'meter', unitPrice: 480, subcategory: 'Power Cables' },
  { sku: 'NLC-CBL-004', name: 'Earthing Copper Wire 8 SWG', category: 'Cables & Wiring', brand: 'Finolex', supplier: 'Finolex Cables Ltd', location: 'Warehouse B', quantity: 0, minStockLevel: 50, maxStockLevel: 400, unit: 'meter', unitPrice: 210, subcategory: 'Earthing' },

  { sku: 'NLC-FLT-001', name: 'Hydraulic Return Filter Element', category: 'Filters', brand: 'Elgi', supplier: 'Elgi Equipments Ltd', location: 'Warehouse A', quantity: 55, minStockLevel: 25, maxStockLevel: 150, unit: 'pcs', unitPrice: 890, subcategory: 'Hydraulic Filters' },
  { sku: 'NLC-FLT-002', name: 'Air Compressor Intake Filter', category: 'Filters', brand: 'Elgi', supplier: 'Elgi Equipments Ltd', location: 'Warehouse A', quantity: 28, minStockLevel: 20, maxStockLevel: 120, unit: 'pcs', unitPrice: 650, subcategory: 'Air Filters' },
  { sku: 'NLC-FLT-003', name: 'Lube Oil Filter Cartridge', category: 'Filters', brand: 'Mann Filter', supplier: 'Elgi Equipments Ltd', location: 'Warehouse A', quantity: 6, minStockLevel: 15, maxStockLevel: 100, unit: 'pcs', unitPrice: 420, subcategory: 'Oil Filters' },

  { sku: 'NLC-TL-001', name: 'Hydraulic Torque Wrench Set', category: 'Tools', brand: 'Enerpac', supplier: 'Elgi Equipments Ltd', location: 'Central Store', quantity: 8, minStockLevel: 5, maxStockLevel: 30, unit: 'set', unitPrice: 45000, subcategory: 'Power Tools' },
  { sku: 'NLC-TL-002', name: 'Digital Multimeter', category: 'Tools', brand: 'Fluke', supplier: 'Havells India Ltd', location: 'Central Store', quantity: 32, minStockLevel: 10, maxStockLevel: 60, unit: 'pcs', unitPrice: 6500, subcategory: 'Test Equipment' },
  { sku: 'NLC-TL-003', name: 'Angle Grinder 4 inch', category: 'Tools', brand: 'Bosch', supplier: 'ABC Industries', location: 'Central Store', quantity: 21, minStockLevel: 10, maxStockLevel: 50, unit: 'pcs', unitPrice: 3200, subcategory: 'Power Tools' },
  { sku: 'NLC-TL-004', name: 'Combination Spanner Set 8-24mm', category: 'Tools', brand: 'Taparia', supplier: 'ABC Industries', location: 'Central Store', quantity: 46, minStockLevel: 15, maxStockLevel: 80, unit: 'set', unitPrice: 1450, subcategory: 'Hand Tools' },
];

module.exports = { categories, suppliers, locations, users, products };
