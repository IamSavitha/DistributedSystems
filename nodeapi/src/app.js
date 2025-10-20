// src/app.js
import express from 'express';
import cors from 'cors';             
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import tasksRouter from './routes/tasks.js';
import { notFound, errorHandler } from './middleware/errors.js';
import Task from './models/Task.js';  // only needed for auto-seed (optional)

dotenv.config();

const app = express();

// CORS (tighten to your React dev URL or loosen to "*")
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Health check
app.get('/', (_req, res) => res.json({ ok: true, service: 'HW6 Tasks API' }));

// Routes
app.use('/api/tasks', tasksRouter);

// 404 + error handler (order matters)
app.use(notFound);
app.use(errorHandler);

// --- Optional: auto-seed when using in-memory db ---
async function maybeSeed() {
  if ((process.env.USE_INMEMORY || '').toLowerCase() !== 'true') return;
  const count = await Task.countDocuments();
  if (count > 0) return;
  await Task.insertMany([
    {
      title: 'Buy milk',
      description: '2% milk for the week',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-10-25',
      category: 'Shopping',
    },
    {
      title: 'Finish HW6 writeup',
      description: 'Add screenshots of API tests',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2025-10-23',
      category: 'Work',
    },
    {
      title: 'Evening walk',
      description: '30 minutes',
      status: 'pending',
      priority: 'low',
      dueDate: '2025-10-22',
      category: 'Health',
    },
  ]);
  console.log(' Auto-seeded sample tasks');
}
// ---------------------------------------------------

await connectDB();
await maybeSeed(); // safe even if not using in-memory

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
