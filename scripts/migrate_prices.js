const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected.');

        // Add columns if they dont exist
        await client.query(`
            ALTER TABLE mess_listings
            ADD COLUMN IF NOT EXISTS weekly_price INTEGER,
            ADD COLUMN IF NOT EXISTS daily_price INTEGER;
        `);
        console.log('Columns added (or already existed).');

        // Verify
        const res = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'mess_listings'
            AND column_name IN ('weekly_price', 'daily_price');
        `);
        console.log('Verify:', JSON.stringify(res.rows));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
