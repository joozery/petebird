import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'petebird';

// Cached across hot-reloads in dev and across invocations in serverless so we
// don't open a new connection on every request.
type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalForMongoose = globalThis as unknown as { __mongoose?: MongooseCache };
const cache: MongooseCache = globalForMongoose.__mongoose ?? { conn: null, promise: null };
globalForMongoose.__mongoose = cache;

export async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!uri) throw new Error('MONGODB_URI is not set. Add it to .env.local — see docs/admin-backend-design.md.');
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { dbName, bufferCommands: false });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
