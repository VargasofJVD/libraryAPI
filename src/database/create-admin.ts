import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { users } from '../database/schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import 'dotenv/config';

async function createAdminUser() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment variables');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@library.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [adminUser] = await db
      .insert(users)
      .values({
        email: 'admin@library.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        isActive: true,
      })
      .returning();

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      status: adminUser.status,
    });

    console.log('\nAdmin credentials:');
    console.log('Email: admin@library.com');
    console.log('Password: admin123');
    console.log('\nUse these credentials to login and create other users.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.end();
  }
}

createAdminUser();
