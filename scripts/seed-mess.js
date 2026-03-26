const db = require('../config/db');

async function seed() {
    try {
        // 1. Create a dummy owner if none exists
        const ownerResult = await db.query('SELECT id FROM mess_owners LIMIT 1');
        let ownerId;

        if (ownerResult.rows.length === 0) {
            console.log('No owners found, creating test owner...');
            const newOwner = await db.query(
                "INSERT INTO mess_owners (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
                ['Test Owner', 'test@example.com', 'hashed_pass', 'OWNER']
            );
            ownerId = newOwner.rows[0].id;
        } else {
            ownerId = ownerResult.rows[0].id;
        }

        // 2. Insert a test mess
        console.log(`Inserting test mess for owner ${ownerId}...`);
        await db.query(`
            INSERT INTO mess_listings (
                mess_owner_id, 
                name, 
                address, 
                cuisine, 
                monthly_price, 
                description, 
                rating, 
                verified, 
                is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
            ownerId,
            'Elite Maratha Mess',
            'Shivaji Nagar, Pune',
            'Maharashtrian',
            3500,
            'Authentic Maharashtrian thali with premium ingredients.',
            4.8,
            true,
            true
        ]);

        console.log('✅ Test mess seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
