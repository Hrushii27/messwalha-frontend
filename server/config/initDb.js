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

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        mess_id INTEGER REFERENCES mess_listings(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        mess_id INTEGER REFERENCES mess_listings(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
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

          -- mess_listings Migrations
          -- Handle legacy columns that might block inserts using exception handling for robustness
          BEGIN
              EXECUTE 'ALTER TABLE mess_listings ALTER COLUMN location DROP NOT NULL';
          EXCEPTION WHEN undefined_column THEN
              NULL; -- Column doesn't exist, ignore
          END;

          BEGIN
              EXECUTE 'ALTER TABLE mess_listings ALTER COLUMN city DROP NOT NULL';
          EXCEPTION WHEN undefined_column THEN
              NULL; -- Column doesn't exist, ignore
          END;

          BEGIN
              EXECUTE 'ALTER TABLE mess_listings ALTER COLUMN price DROP NOT NULL';
          EXCEPTION WHEN undefined_column THEN
              NULL; -- Column doesn't exist, ignore
          END;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='address') THEN
              ALTER TABLE mess_listings ADD COLUMN address TEXT NOT NULL DEFAULT '';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='cuisine') THEN
              ALTER TABLE mess_listings ADD COLUMN cuisine VARCHAR(100);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='monthly_price') THEN
              ALTER TABLE mess_listings ADD COLUMN monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='description') THEN
              ALTER TABLE mess_listings ADD COLUMN description TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='rating') THEN
              ALTER TABLE mess_listings ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0.0;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='verified') THEN
              ALTER TABLE mess_listings ADD COLUMN verified BOOLEAN DEFAULT FALSE;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='image_url') THEN
              ALTER TABLE mess_listings ADD COLUMN image_url TEXT;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='is_active') THEN
              ALTER TABLE mess_listings ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
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
