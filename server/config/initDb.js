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

    CREATE TABLE IF NOT EXISTS student_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
      mess_id INTEGER REFERENCES mess_listings(id) ON DELETE CASCADE,
      plan_type VARCHAR(50) DEFAULT 'monthly',
      status VARCHAR(20) DEFAULT 'active',
      start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, mess_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES mess_owners(id) ON DELETE CASCADE,
      mess_id INTEGER REFERENCES mess_listings(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'SUCCESS',
      transaction_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      otp_code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Migrations and Column Checks
    DO $$ 
    BEGIN 
        -- mess_owners migrations
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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='google_id') THEN
            ALTER TABLE mess_owners ADD COLUMN google_id VARCHAR(255) UNIQUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_owners' AND column_name='profile_picture') THEN
            ALTER TABLE mess_owners ADD COLUMN profile_picture TEXT;
        END IF;

        -- mess_listings migrations
        BEGIN
            EXECUTE 'ALTER TABLE mess_listings ALTER COLUMN location DROP NOT NULL';
        EXCEPTION WHEN undefined_column THEN NULL; END;
        
        BEGIN
            EXECUTE 'ALTER TABLE mess_listings ALTER COLUMN city DROP NOT NULL';
        EXCEPTION WHEN undefined_column THEN NULL; END;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='address') THEN
            ALTER TABLE mess_listings ADD COLUMN address TEXT NOT NULL DEFAULT '';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='cuisine') THEN
            ALTER TABLE mess_listings ADD COLUMN cuisine VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='monthly_price') THEN
            ALTER TABLE mess_listings ADD COLUMN monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='veg_nonveg') THEN
            ALTER TABLE mess_listings ADD COLUMN veg_nonveg VARCHAR(20) DEFAULT 'Both';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='college_tags') THEN
            ALTER TABLE mess_listings ADD COLUMN college_tags TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='city') THEN
            ALTER TABLE mess_listings ADD COLUMN city VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='status') THEN
            ALTER TABLE mess_listings ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='upi_id') THEN
            ALTER TABLE mess_listings ADD COLUMN upi_id VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='menu_images') THEN
            ALTER TABLE mess_listings ADD COLUMN menu_images TEXT[] DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='review_count') THEN
            ALTER TABLE mess_listings ADD COLUMN review_count INTEGER DEFAULT 0;
        END IF;

        -- Ensure unique mess per owner
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name='mess_listings' AND constraint_type='UNIQUE' 
            AND constraint_name='unique_owner_mess'
        ) THEN
            -- Note: This might fail if duplicates already exist.
            BEGIN
                ALTER TABLE mess_listings ADD CONSTRAINT unique_owner_mess UNIQUE (mess_owner_id);
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not add unique_owner_mess constraint, possibly due to existing duplicates.';
            END;
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
