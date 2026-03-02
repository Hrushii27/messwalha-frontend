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
            },
            {
                name: "Shree Ganesh Mess",
                location: "FC Road, Pune",
                price: 2800,
                cuisine: "Maharashtrian",
                description: "Popular mess on FC Road.",
                images: ["/messes/thali.png"]
            },
            {
                name: "Om Sai Tiffin Services",
                location: "Karve Nagar, Pune",
                price: 2100,
                cuisine: "Veg",
                description: "Reliable tiffin service in Karve Nagar.",
                images: ["/messes/curry.png"]
            },
            {
                name: "Annapurna Mess",
                location: "Kothrud, Pune",
                price: 2600,
                cuisine: "Maharashtrian",
                description: "Delicious Kothrud specialty.",
                images: ["/messes/thali.png"]
            },
            {
                name: "Annapurna Mess (Mumbai)",
                location: "Andheri East, Mumbai",
                price: 3200,
                cuisine: "North Indian",
                description: "Authentic taste in Andheri.",
                images: ["/messes/curry.png"]
            },
            {
                name: "Maa Durga Tiffin Center",
                location: "Dadar West, Mumbai",
                price: 2900,
                cuisine: "Veg",
                description: "Dadar's favorite tiffin center.",
                images: ["/messes/thali.png"]
            },
            {
                name: "Shree Sai Mess",
                location: "Vashi, Navi Mumbai",
                price: 3000,
                cuisine: "Veg",
                description: "Quality food in Vashi.",
                images: ["/messes/curry.png"]
            },
            {
                name: "Mahalaxmi Mess",
                location: "Rajendra Nagar, Kolhapur",
                price: 2400,
                cuisine: "Maharashtrian",
                description: "Serving Rajendra Nagar with pride.",
                images: ["/messes/thali.png"]
            },
            {
                name: "Shivneri Mess",
                location: "Near Central Bus Stand, Kolhapur",
                price: 2500,
                cuisine: "Maharashtrian",
                description: "Convenient location near CBS.",
                images: ["/messes/curry.png"]
            },
            {
                name: "South Spice Corner",
                location: "Kothrud, Pune",
                price: 2400,
                cuisine: "South Indian",
                description: "Best South Indian thalis and breakfast.",
                images: ["/messes/thali.png"]
            },
            {
                name: "Student Corner Mess",
                location: "Model Colony, Pune",
                price: 2200,
                cuisine: "North Indian",
                description: "Homemade quality for students.",
                images: ["/messes/curry.png"]
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
                    4.0 + Math.random(),
                    true,
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
