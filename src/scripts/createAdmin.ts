import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows / ISP DNS querySrv EBADRESP error
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore fallback
}

import User from '../models/User';
import { connectDatabase } from '../config/database';

async function createAdmin() {
  const args = process.argv.slice(2);
  const parsedArgs: Record<string, string> = {};

  args.forEach((arg) => {
    const [key, value] = arg.split('=');
    if (key && value) {
      parsedArgs[key.replace(/^--?/, '').toLowerCase()] = value;
    }
  });

  const name = parsedArgs.name || process.env.ADMIN_NAME || 'Master Beekeeper';
  const email = (parsedArgs.email || process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase().trim();
  const password = parsedArgs.password || process.env.ADMIN_PASSWORD || '123456';
  const phone = parsedArgs.phone || '+91 98765 43210';

  console.log(`[Admin Setup] Connecting to database...`);
  await connectDatabase();

  try {
    let user = await User.findOne({ email }).select('+password');

    if (user) {
      console.log(`[Admin Setup] User with email "${email}" already exists. Updating to Admin...`);
      user.name = name;
      user.role = 'admin';
      user.isActive = true;
      user.password = password; // pre-save hook will hash the password
      if (phone) user.phone = phone;
      await user.save();
      console.log(`[Admin Setup] Successfully updated user "${email}" as Admin!`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'admin',
        isActive: true,
      });
      console.log(`[Admin Setup] Successfully created new Admin account for "${email}"!`);
    }

    console.log('\n=======================================');
    console.log('🍯 Admin Credentials Ready:');
    console.log(`📧 Email:    ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🛡️  Role:     admin`);
    console.log('=======================================\n');
  } catch (error: any) {
    console.error('[Admin Setup] Error creating/updating admin account:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('[Admin Setup] Disconnected from database.');
    process.exit(0);
  }
}

createAdmin();
