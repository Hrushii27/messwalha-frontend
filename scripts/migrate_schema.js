const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = `
            ALTER TABLE mess_listings
            ADD COLUMN IF NOT EXISTS owner_name TEXT,
            ADD COLUMN IF NOT EXISTS contact_number TEXT,
            ADD COLUMN IF NOT EXISTS weekly_price INTEGER,
            ADD COLUMN IF NOT EXISTS daily_price INTEGER,
            ADD COLUMN IF NOT EXISTS menu_description TEXT,
            ADD COLUMN IF NOT EXISTS display_photo TEXT,
            ADD COLUMN IF NOT EXISTS upi_id TEXT;
        `;

        await client.query(sql);
        console.log('Schema migration successful.');

        const res = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'mess_listings'
            AND column_name IN (
                'owner_name', 'contact_number', 'weekly_price', 'daily_price',
                'menu_description', 'display_photo', 'upi_id'
            )
            ORDER BY column_name;
        `);
        console.log('Verified columns:', JSON.stringify(res.rows));

    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await client.end();
        console.log('Done.');
    }
}

migrate();
