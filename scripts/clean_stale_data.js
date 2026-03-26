const { Client } = require('pg');

async function cleanStaleData() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected.');

        // Clear the hardcoded fallback strings that were saved to the DB
        const result = await client.query(`
            UPDATE mess_listings
            SET
                owner_name = CASE
                    WHEN owner_name = 'Authorized Personnel' THEN NULL
                    ELSE owner_name
                END,
                contact_number = CASE
                    WHEN contact_number = 'Not Available' THEN NULL
                    ELSE contact_number
                END
            WHERE owner_name = 'Authorized Personnel'
               OR contact_number = 'Not Available'
            RETURNING id, owner_name, contact_number;
        `);

        console.log('Cleaned rows:', result.rowCount);
        console.log('After cleanup:', JSON.stringify(result.rows));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        console.log('Done.');
    }
}

cleanStaleData();
