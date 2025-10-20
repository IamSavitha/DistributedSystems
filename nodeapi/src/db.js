import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const useInMemory = String(process.env.USE_INMEMORY || '').toLowerCase() === 'true';

async function connectInMemory() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to in-memory MongoDB');
  // close the in-memory server when Node exits
  const cleanup = async () => {
    await mongoose.disconnect().catch(() => {});
    await mongod.stop().catch(() => {});
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

export async function connectDB() {
  mongoose.set('strictQuery', true);
  if (useInMemory) {
    return connectInMemory().catch((err) => {
      console.error('In-memory Mongo error:', err?.message || err);
      process.exit(1);
    });
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env or USE_INMEMORY=true');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(' Connected to MongoDB');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  }
}
