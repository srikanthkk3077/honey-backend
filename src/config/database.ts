import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows / ISP DNS querySrv EBADRESP error
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore fallback
}

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/madhuvan_honey';

    const conn = await mongoose.connect(mongoUri);

    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB connection error:', err);
});

export default connectDatabase;
