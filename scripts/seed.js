const db = require('../config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log('🚀 Starting PostgreSQL seeding...');

        // 1. Create Owner
        const passwordHash = await bcrypt.hash('password123', 10);
        const ownerResult = await db.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            ['Rajesh Kumar', 'owner@example.com', '9876543210', passwordHash, 'OWNER']
        );
        const ownerId = ownerResult.rows[0].id;
        console.log('✅ Owner created/updated');

        // 2. Create Subscription
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 60);
        await db.query(
            'INSERT INTO owner_subscriptions (owner_id, trial_start_date, trial_end_date, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [ownerId, new Date(), trialEnd, 'trial']
        );
        console.log('✅ Subscription created');

        // 3. Create Mess Listings
        const messes = [
            {
                name: "Nikam Mess",
                location: "Behind DYP College, Kasba Bawada, Kolhapur",
                price: 2500,
                cuisine: "Maharashtrian",
                description: "Homely meals near DYP College.",
                images: ["/messes/thali.png", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"]
            },
            {
                name: "Wavare Mess",
                location: "Kasba Bawada, Kolhapur",
                price: 2200,
                cuisine: "Maharashtrian",
                description: "Traditional taste in Kasba Bawada.",
                images: ["/messes/curry.png", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"]
            },
            {
                name: "Yadhav Mess",
                location: "Behind DYP College, Kolhapur",
                price: 2400,
                cuisine: "Veg",
                description: "Student-friendly mess behind DYP.",
                images: ["/messes/thali.png"]
            },
            {
                name: "Sai Mess",
                location: "Kasba Bawada, Kolhapur",
                price: 2300,
                cuisine: "Veg",
                description: "Quality meals in Kasba Bawada.",
                images: ["/messes/curry.png"]
            }
        ];

        for (const mess of messes) {
            await db.query(
                `INSERT INTO messes 
                (owner_id, mess_name, owner_name, mobile, address, price_per_month, price_per_week, price_per_day, menu_text, mess_image, rating, is_active) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    ownerId,
                    mess.name,
                    'Rajesh Kumar',
                    '9876543210',
                    mess.location,
                    mess.price,
                    Math.round(mess.price / 4),
                    Math.round(mess.price / 30),
                    mess.description,
                    mess.images[0],
                    4.0 + Math.random(),
                    true
                ]
            );
            console.log(`✅ Seeded: ${mess.name}`);
        }

        console.log('✨ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
