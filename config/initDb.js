const db = require('./db');

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS mess_owners (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'OWNER', -- STUDENT, OWNER
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      mess_owner_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
      plan_type VARCHAR(50) NOT NULL, -- trial, basic_599
      trial_start TIMESTAMP WITH TIME ZONE,
      trial_end TIMESTAMP WITH TIME ZONE,
      status VARCHAR(20) NOT NULL, -- trial, active, expired, cancelled
      next_billing_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mess_listings (
      id SERIAL PRIMARY KEY,
      mess_owner_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      location TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      description TEXT,
      images TEXT[] DEFAULT '{}',
      is_active BOOLEAN DEFAULT TRUE,
      verified BOOLEAN DEFAULT FALSE,
      rating DECIMAL(3, 2) DEFAULT 0.0,
      cuisine VARCHAR(100),
      monthly_price DECIMAL(10, 2),
      menus JSONB DEFAULT '[]', -- Added for daily menus
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_subscriptions (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
      mess_id INTEGER REFERENCES mess_listings(id) ON DELETE CASCADE,
      plan_type VARCHAR(50) NOT NULL, -- monthly, quarterly, etc.
      status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled
      start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      mess_id INTEGER REFERENCES mess_listings(id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE mess_owners ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'OWNER';
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
