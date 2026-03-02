const db = require('../config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log('🚀 Starting PostgreSQL seeding...');

        // 1. Create Owner
        const passwordHash = await bcrypt.hash('password123', 10);
        const ownerResult = await db.query(
            'INSERT INTO mess_owners (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            ['Rajesh Kumar', 'owner@example.com', '9876543210', passwordHash]
        );
        const ownerId = ownerResult.rows[0].id;
        console.log('✅ Owner created/updated');

        // 2. Create Subscription
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 60);
        await db.query(
            'INSERT INTO subscriptions (mess_owner_id, plan_type, trial_start, trial_end, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
            [ownerId, 'trial', new Date(), trialEnd, 'trial']
        );
        console.log('✅ Subscription created');

        // 3. Create Mess Listings
        const messes = [
            {
                name: 'Nikam Mess',
                location: 'Behind DYP College, Kasba Bawada, Kolhapur',
                price: 2500,
                description: 'Homely meals and great atmosphere near DYP College.',
                images: ['/messes/thali.png', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
                cuisine: 'Maharashtrian',
                rating: 4.8,
                verified: true
            },
            {
                name: 'Annapurna Tiffin',
                location: 'Kothrud, Pune',
                price: 2200,
                description: 'Authentic Maharashtrian taste with fresh ingredients.',
                images: ['/messes/curry.png', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'],
                cuisine: 'Veg',
                rating: 4.5,
                verified: true
            },
            {
                name: 'Sai Palace Mess',
                location: 'Dadar West, Mumbai',
                price: 3000,
                description: 'Quality vegetarian meals for students and office goers.',
                images: ['https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80'],
                cuisine: 'North Indian',
                rating: 4.2,
                verified: true
            }
        ];

        for (const mess of messes) {
            await db.query(
                `INSERT INTO mess_listings 
                (mess_owner_id, name, location, monthly_price, price, description, images, cuisine, rating, verified, is_active) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    ownerId,
                    mess.name,
                    mess.location,
                    mess.price,
                    mess.price,
                    mess.description,
                    mess.images,
                    mess.cuisine,
                    mess.rating,
                    mess.verified,
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
