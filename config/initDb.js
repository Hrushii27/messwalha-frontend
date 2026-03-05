const db = require('./db');

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password VARCHAR(255) NOT NULL, -- Renamed from password_hash for consistency
      role VARCHAR(20) DEFAULT 'OWNER', -- STUDENT, OWNER
      profile_image TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
 
    CREATE TABLE IF NOT EXISTS owner_subscriptions (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      trial_end_date TIMESTAMP WITH TIME ZONE,
      subscription_start TIMESTAMP WITH TIME ZONE,
      subscription_end TIMESTAMP WITH TIME ZONE,
      price INTEGER DEFAULT 499,
      status TEXT, -- 'trial', 'active', 'expired'
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
 
    CREATE TABLE IF NOT EXISTS messes (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      mess_name TEXT NOT NULL,
      owner_name TEXT,
      mobile TEXT,
      address TEXT,
      price_per_month INTEGER,
      price_per_week INTEGER,
      price_per_day INTEGER,
      menu_text TEXT,
      mess_image TEXT,
      menu_images TEXT[] DEFAULT '{}',
      is_active BOOLEAN DEFAULT TRUE,
      rating NUMERIC(3,2) DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
 
    CREATE TABLE IF NOT EXISTS student_subscriptions (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      mess_id INTEGER REFERENCES messes(id) ON DELETE CASCADE,
      plan_type VARCHAR(50) NOT NULL, -- monthly, quarterly, etc.
      status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled
      start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
 
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      mess_id INTEGER REFERENCES messes(id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'OWNER';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
  `;

  try {
    console.log("⏳ Initializing database tables...");
    await db.query(queryText);
    console.log("✅ Database tables initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing database tables:", err.message);
    console.error("Full Error:", err);
  }
};

module.exports = { createTables };
