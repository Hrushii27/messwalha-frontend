const db = require('./db');

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS mess_owners (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'STUDENT',
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

      CREATE TABLE IF NOT EXISTS mess_listings (
        id SERIAL PRIMARY KEY,
        mess_owner_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        cuisine VARCHAR(100),
        monthly_price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        rating DECIMAL(3, 2) DEFAULT 0.0,
        verified BOOLEAN DEFAULT FALSE,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
        mess_id INTEGER REFERENCES mess_listings(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, mess_id)
      );

      -- Migration: Add role and profile_image columns if they don't exist
      DO $$ 
      BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='role') THEN
              ALTER TABLE mess_owners ADD COLUMN role VARCHAR(20) DEFAULT 'STUDENT';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='profile_image') THEN
              ALTER TABLE mess_owners ADD COLUMN profile_image TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='reset_password_token') THEN
              ALTER TABLE mess_owners ADD COLUMN reset_password_token VARCHAR(255);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='reset_password_expires') THEN
              ALTER TABLE mess_owners ADD COLUMN reset_password_expires TIMESTAMP WITH TIME ZONE;
          END IF;
      END $$;
    `;

  try {
    await db.query(queryText);
    console.log("Tables created successfully");
  } catch (err) {
    console.error("Error creating tables", err);
  }
};

module.exports = { createTables };
