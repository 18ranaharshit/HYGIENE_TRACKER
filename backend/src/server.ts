import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { seedData } from './seed';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import toiletRoutes from './routes/toiletRoutes';
import ratingRoutes from './routes/ratingRoutes';
import expenseRoutes from './routes/expenseRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = process.env.PORT ?? 5000;

// ── Middleware ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' })); // 10mb for base64 photo uploads
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/toilets', toiletRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Error handler (must be last) ──────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────
connectDB().then(async () => {
  // If no URI provided, we are in-memory, so seed the data
  if (!process.env.MONGODB_URI) {
    await seedData();
  }
  app.listen(PORT, () => console.log(`🚀 CleanRoute API running on http://localhost:${PORT}`));
});

export default app;
