const { Client } = require('pg');

async function cleanAndVerify() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected.');

        // Check what is currently in the DB
        const before = await client.query(`SELECT id, owner_name, contact_number FROM mess_listings`);
        console.log('BEFORE:', JSON.stringify(before.rows));

        // Clear any row where stringified fallbacks were saved
        await client.query(`
            UPDATE mess_listings
            SET
                owner_name = NULL,
                contact_number = NULL
            WHERE owner_name IN ('Authorized Personnel', 'Not Available')
               OR contact_number IN ('Authorized Personnel', 'Not Available')
        `);

        const after = await client.query(`SELECT id, owner_name, contact_number FROM mess_listings`);
        console.log('AFTER:', JSON.stringify(after.rows));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        console.log('Done.');
    }
}

cleanAndVerify();
