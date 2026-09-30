import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🍯 Madhuvan Honey Backend API Server Running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    const handleExit = (signal: string) => {
      console.log(`\n[Process] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Process] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleExit('SIGTERM'));
    process.on('SIGINT', () => handleExit('SIGINT'));

    process.on('unhandledRejection', (err: any) => {
      console.error('[Process] Unhandled Rejection:', err);
    });

    process.on('uncaughtException', (err: any) => {
      console.error('[Process] Uncaught Exception:', err);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
