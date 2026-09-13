import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('Creating tables...');

    // Extensions for UUIDs if not already enabled
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 1. admin_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_hash VARCHAR(255) UNIQUE NOT NULL,
        device_name VARCHAR(255) NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_used_at TIMESTAMP,
        revoked BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('Created admin_sessions table');

    // 2. enquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id VARCHAR(50) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        form_type VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        company VARCHAR(255),
        service VARCHAR(255),
        urgency VARCHAR(50),
        message TEXT,
        pdf_url VARCHAR(1024),
        cloudinary_url VARCHAR(1024),
        pdf_name VARCHAR(255),
        pdf_size INTEGER,
        status VARCHAR(50) DEFAULT 'NEW',
        ip_address VARCHAR(45),
        email_dispatched BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('Created enquiries table');

    // 3. career_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS career_applications (
        id VARCHAR(50) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        experience_years INTEGER,
        cover_letter TEXT,
        resume_url VARCHAR(1024),
        cloudinary_url VARCHAR(1024),
        status VARCHAR(50) DEFAULT 'NEW',
        ip_address VARCHAR(45),
        email_dispatched BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('Created career_applications table');

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing DB:', error);
  } finally {
    client.release();
    pool.end();
  }
}

initDB();
