import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User';
import { Toilet } from './models/Toilet';
import { Rating } from './models/Rating';
import { Expense } from './models/Expense';
import { MaintenanceTicket } from './models/MaintenanceTicket';

// ── Bengaluru toilet locations ──────────────────────────────────────────────
const TOILET_DATA = [
  { name: 'Cubbon Park Block A', address: 'Cubbon Park, Bengaluru', coordinates: [77.5946, 12.9763], type: 'public', amenities: ['wheelchair', 'soap', 'paper'], hygieneScore: 88 },
  { name: 'Lalbagh Garden Entrance', address: 'Lalbagh Rd, Bengaluru', coordinates: [77.5855, 12.9507], type: 'public', amenities: ['soap', 'paper', 'sanitizer'], hygieneScore: 85 },
  { name: 'MG Road Metro Exit', address: 'MG Road, Bengaluru', coordinates: [77.6101, 12.9742], type: 'public', amenities: ['wheelchair', 'soap'], hygieneScore: 76 },
  { name: 'Ulsoor Lake East Gate', address: 'Ulsoor Lake, Bengaluru', coordinates: [77.6228, 12.9838], type: 'public', amenities: ['soap', 'paper'], hygieneScore: 72 },
  { name: 'Brigade Road Public Facility', address: 'Brigade Road, Bengaluru', coordinates: [77.6077, 12.9716], type: 'public', amenities: ['soap', 'sanitizer'], hygieneScore: 80 },
  { name: 'Koramangala 5th Block', address: 'Koramangala, Bengaluru', coordinates: [77.6268, 12.9352], type: 'paid', amenities: ['wheelchair', 'soap', 'paper', 'sanitizer'], hygieneScore: 92 },
  { name: 'Indiranagar 100ft Road', address: 'Indiranagar, Bengaluru', coordinates: [77.6410, 12.9784], type: 'public', amenities: ['soap'], hygieneScore: 65 },
  { name: 'Marathahalli Bridge', address: 'Marathahalli, Bengaluru', coordinates: [77.6972, 12.9591], type: 'public', amenities: ['soap', 'paper'], hygieneScore: 58 },
  { name: 'Electronic City Phase 1', address: 'Electronic City, Bengaluru', coordinates: [77.6741, 12.8399], type: 'paid', amenities: ['wheelchair', 'soap', 'paper', 'sanitizer'], hygieneScore: 90 },
  { name: 'Bannerghatta Road Park', address: 'Bannerghatta, Bengaluru', coordinates: [77.5796, 12.8731], type: 'public', amenities: ['soap'], hygieneScore: 62 },
  { name: 'Whitefield ITPL Gate', address: 'Whitefield, Bengaluru', coordinates: [77.7480, 12.9698], type: 'paid', amenities: ['wheelchair', 'soap', 'paper', 'sanitizer'], hygieneScore: 95 },
  { name: 'Jayanagar 4th Block', address: 'Jayanagar, Bengaluru', coordinates: [77.5829, 12.9259], type: 'public', amenities: ['soap', 'paper'], hygieneScore: 78 },
  { name: 'Rajajinagar Main Market', address: 'Rajajinagar, Bengaluru', coordinates: [77.5522, 12.9914], type: 'public', amenities: ['soap'], hygieneScore: 55 },
  { name: 'Malleswaram 8th Cross', address: 'Malleswaram, Bengaluru', coordinates: [77.5627, 13.0035], type: 'public', amenities: ['soap', 'paper'], hygieneScore: 73 },
  { name: 'Yeshwantpur Bus Stand', address: 'Yeshwantpur, Bengaluru', coordinates: [77.5540, 13.0218], type: 'public', amenities: ['soap'], hygieneScore: 48 },
  { name: 'Hebbal Lake View Point', address: 'Hebbal, Bengaluru', coordinates: [77.5941, 13.0353], type: 'public', amenities: ['soap', 'sanitizer'], hygieneScore: 70 },
  { name: 'Silk Board Junction', address: 'Silk Board, Bengaluru', coordinates: [77.6228, 12.9176], type: 'public', amenities: ['soap'], hygieneScore: 52 },
  { name: 'HAL Airport Road', address: 'HAL, Bengaluru', coordinates: [77.6665, 12.9718], type: 'public', amenities: ['wheelchair', 'soap', 'paper'], hygieneScore: 82 },
  { name: 'Shivajinagar Bus Terminus', address: 'Shivajinagar, Bengaluru', coordinates: [77.6011, 12.9852], type: 'public', amenities: ['soap'], hygieneScore: 60 },
  { name: 'JP Nagar Phase 2', address: 'JP Nagar, Bengaluru', coordinates: [77.5836, 12.9081], type: 'paid', amenities: ['wheelchair', 'soap', 'paper', 'sanitizer'], hygieneScore: 87 },
];

const ISSUES_POOL = [
  'No soap dispenser', 'Broken door latch', 'Poor lighting', 'Clogged drain',
  'Missing paper towels', 'Foul odour', 'Damaged tiles', 'No hand sanitizer',
  'Water leakage', 'Graffiti on walls',
];

/**
 * Seed script — populates the database with demo data.
 */
export async function seedData() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Toilet.deleteMany({}), Rating.deleteMany({}),
    Expense.deleteMany({}), MaintenanceTicket.deleteMany({}),
  ]);

  // ── Seed Users ────────────────────────────────────────────────────────────
  const [adminUser, user1, user2] = await User.insertMany([
    { name: 'Admin CleanRoute', email: 'admin@cleanroute.com', passwordHash: await bcrypt.hash('Admin@123', 12), role: 'admin' },
    { name: 'Priya Sharma', email: 'priya@example.com', passwordHash: await bcrypt.hash('User@123', 12), role: 'user' },
    { name: 'Arjun Menon', email: 'arjun@example.com', passwordHash: await bcrypt.hash('User@123', 12), role: 'user' },
  ]);

  // ── Seed Toilets ──────────────────────────────────────────────────────────
  const toilets = await Toilet.insertMany(
    TOILET_DATA.map(t => ({
      ...t,
      location: { type: 'Point', coordinates: t.coordinates },
      isOpen: Math.random() > 0.15,
      lastInspected: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      photos: [],
      addedBy: adminUser._id,
    })),
  );

  // ── Seed Ratings ──────────────────────────────────────────────────────────
  const ratingUsers = [user1, user2];
  const ratingsToInsert = [];
  for (let i = 0; i < toilets.length && ratingsToInsert.length < 50; i++) {
    for (const u of ratingUsers) {
      if (ratingsToInsert.length >= 50) break;
      ratingsToInsert.push({
        toiletId: toilets[i]._id,
        userId: u._id,
        cleanliness: Math.ceil(Math.random() * 2) + 3,
        accessibility: Math.ceil(Math.random() * 2) + 3,
        facilities: Math.ceil(Math.random() * 2) + 3,
        comment: ['Great facility!', 'Needs improvement.', 'Clean and accessible.', 'Could be better maintained.'][Math.floor(Math.random() * 4)],
        photos: [],
        helpful: [],
      });
    }
  }
  await Rating.insertMany(ratingsToInsert);

  // ── Seed Expenses (6 months) ──────────────────────────────────────────────
  const categories: Array<'cleaning' | 'repair' | 'supplies' | 'inspection'> = ['cleaning', 'repair', 'supplies', 'inspection'];
  const expenses = [];
  for (let m = 0; m < 6; m++) {
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - m);
      expenses.push({
        toiletId: toilets[Math.floor(Math.random() * toilets.length)]._id,
        category: categories[Math.floor(Math.random() * categories.length)],
        amount: Math.round((Math.random() * 4500 + 500) * 10) / 10,
        currency: 'INR',
        description: ['Monthly cleaning contract', 'Pipe repair', 'Soap refill', 'Annual inspection'][Math.floor(Math.random() * 4)],
        date,
        addedBy: adminUser._id,
      });
    }
  }
  await Expense.insertMany(expenses);

  // ── Seed Maintenance Tickets ──────────────────────────────────────────────
  await MaintenanceTicket.insertMany([
    { toiletId: toilets[0]._id, issue: 'Soap dispenser broken in stall 2', severity: 'medium', status: 'open', reportedBy: user1._id },
    { toiletId: toilets[1]._id, issue: 'Flooding in ladies section', severity: 'critical', status: 'in-progress', reportedBy: user2._id, assignedTo: adminUser._id },
    { toiletId: toilets[2]._id, issue: 'No tissue paper since 3 days', severity: 'low', status: 'open', reportedBy: user1._id },
    { toiletId: toilets[4]._id, issue: 'Door lock broken in gents side', severity: 'high', status: 'open', reportedBy: user2._id },
    { toiletId: toilets[6]._id, issue: 'Poor lighting inside facility', severity: 'medium', status: 'in-progress', reportedBy: user1._id },
  ]);

  console.log('✅ Database seeded successfully!');
}

if (require.main === module) {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/cleanroute';
  mongoose.connect(uri).then(async () => {
    await seedData();
    await mongoose.disconnect();
    process.exit(0);
  }).catch(err => { console.error('Seed failed:', err); process.exit(1); });
}
