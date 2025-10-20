import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './db.js';
import Task from './models/Task.js';

const samples = [
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
];

(async () => {
  await connectDB();
  await Task.deleteMany({});
  const result = await Task.insertMany(samples);
  console.log(`✅ Seeded ${result.length} tasks`);
  process.exit(0);
})();
