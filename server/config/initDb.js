const db = require('./db');

const createTables = async () => {
    const queryText = `
    -- Core tables
    CREATE TABLE IF NOT EXISTS mess_owners (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'STUDENT',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      google_id VARCHAR(255) UNIQUE,
      profile_picture TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      mess_owner_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
      plan_type VARCHAR(50) NOT NULL,
      trial_start TIMESTAMP WITH TIME ZONE,
      trial_end TIMESTAMP WITH TIME ZONE,
      status VARCHAR(20) NOT NULL,
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

    -- Special handling for reviews (recreate if broken)
    DO $$ 
    BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'student_id') THEN
                DROP TABLE reviews;
            END IF;
        END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      mess_id INTEGER REFERENCES mess_listings(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Special handling for notifications (recreate if broken/legacy)
    DO $$ 
    BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title') THEN
                DROP TABLE notifications;
            END IF;
        END IF;
    END $$;

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
    
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      otp_code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Additional Migrations
    DO $$ 
    BEGIN 
        -- owners metadata
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='profile_image') THEN
            ALTER TABLE mess_owners ADD COLUMN profile_image TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='reset_password_token') THEN
            ALTER TABLE mess_owners ADD COLUMN reset_password_token VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='reset_password_expires') THEN
            ALTER TABLE mess_owners ADD COLUMN reset_password_expires TIMESTAMP WITH TIME ZONE;
        END IF;

        -- Listing improvements
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='veg_nonveg') THEN
            ALTER TABLE mess_listings ADD COLUMN veg_nonveg VARCHAR(20) DEFAULT 'Both';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='college_tags') THEN
            ALTER TABLE mess_listings ADD COLUMN college_tags TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='city') THEN
            ALTER TABLE mess_listings ADD COLUMN city VARCHAR(100);
        END IF;
    END $$;
    `;

    try {
        await db.query(queryText);
        console.log("✅ Database schema verified and synchronized successfully");
    } catch (err) {
        console.error("❌ Database initialization error:", err);
        throw err;
    }
};

module.exports = { createTables };
