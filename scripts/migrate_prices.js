const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected. Running migration...');
        
        const sql = `
            ALTER TABLE mess_listings 
            ADD COLUMN IF NOT EXISTS weekly_price INTEGER, 
            ADD COLUMN IF NOT EXISTS daily_price INTEGER;
        `;
        
        await client.query(sql);
        console.log('Migration successful: weekly_price and daily_price columns added.');
        
        const verifySql = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mess_listings' AND column_name IN ('weekly_price', 'daily_price');";
        const res = await client.query(verifySql);
        console.log('Verification Results:', res.rows);
        
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

migrate();
