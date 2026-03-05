const db = require('../config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log('🚀 Starting deep PostgreSQL seeding...');

        // 1. Create Owner
        const passwordHash = await bcrypt.hash('password123', 10);
        const ownerResult = await db.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            ['Rajesh Kumar', 'owner@example.com', '9876543210', passwordHash, 'OWNER']
        );
        const ownerId = ownerResult.rows[0].id;
        console.log('✅ Owner created/updated');

        // 2. Clear existing messes to avoid duplicates during re-seed
        await db.query('DELETE FROM messes');
        console.log('🧹 Existing messes cleared');

        // 3. Subscription
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 60);
        await db.query(
            'INSERT INTO owner_subscriptions (owner_id, trial_start_date, trial_end_date, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
            [ownerId, new Date(), trialEnd, 'trial']
        );

        // 4. Seeding Data from User List
        const messesData = [
            // Kolhapur
            { name: 'Nikam Mess', owner: 'Savita Nikam', mobile: '7057165076', city: 'Kolhapur', cuisine: 'Maharashtrian', price: 2500, address: 'Behind DYP College, Kasba Bawada, Kolhapur', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0' },
            { name: 'Wavare Mess', owner: 'Mina Wavare', mobile: '9322008818', city: 'Kolhapur', cuisine: 'Maharashtrian', price: 2700, address: 'Dhangal Gali, Kasba Bawada, Kolhapur', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be' },
            { name: 'Yadhav Mess', owner: 'Yadhav', mobile: '9145236780', city: 'Kolhapur', cuisine: 'Veg', price: 2400, address: 'Behind DYP College, Kasba Bawada, Kolhapur', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
            { name: 'Sai Mess', owner: 'Ganesh Patil', mobile: '9765021345', city: 'Kolhapur', cuisine: 'Veg', price: 2300, address: 'Kasba Bawada, Kolhapur', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' },

            // Pune
            { name: 'Shree Ganesh Mess', owner: 'Amit Patil', mobile: '9823001122', city: 'Pune', cuisine: 'Maharashtrian', price: 3200, address: 'Near FC Road, Shivajinagar, Pune', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be' },
            { name: 'Annapurna Mess', owner: 'Seema Kulkarni', mobile: '9096012345', city: 'Pune', cuisine: 'Maharashtrian', price: 3000, address: 'Kothrud, Pune', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0' },
            { name: 'Om Sai Tiffin Service', owner: 'Ramesh Jadhav', mobile: '9765402211', city: 'Pune', cuisine: 'Veg', price: 2800, address: 'Karve Nagar, Pune', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' },

            // Mumbai
            { name: 'Maa Durga Mess', owner: 'Rajesh Gupta', mobile: '9898989898', city: 'Mumbai', cuisine: 'North Indian', price: 3500, address: 'Dadar West, Mumbai', image: 'https://images.unsplash.com/photo-1515516969-d4008cc6241a' },
            { name: 'Annapurna Tiffin Center', owner: 'Sunita Sharma', mobile: '9876543210', city: 'Mumbai', cuisine: 'North Indian', price: 3300, address: 'Andheri East, Mumbai', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe' },
            { name: 'Shree Sai Mess', owner: 'Manoj Yadav', mobile: '9768004455', city: 'Mumbai', cuisine: 'Veg', price: 3100, address: 'Vashi, Navi Mumbai', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },

            // Goa
            { name: 'Konkan Home Mess', owner: 'Suresh Naik', mobile: '9422056677', city: 'Goa', cuisine: 'South Indian', price: 3500, address: 'Ponda, Goa', image: 'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f' },
            { name: 'Sai Krupa Mess', owner: 'Mahesh Gaonkar', mobile: '9326123456', city: 'Goa', cuisine: 'South Indian', price: 3300, address: 'Fatorda, Margao, Goa', image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4' },
            { name: 'Shree Datta Mess', owner: 'Prakash Kamat', mobile: '9767896543', city: 'Goa', cuisine: 'Maharashtrian', price: 3000, address: 'Mapusa Market Area, Goa', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0' },

            // Nashik
            { name: 'Godavari Mess', owner: 'Sanjay Pawar', mobile: '9822455566', city: 'Nashik', cuisine: 'Maharashtrian', price: 2700, address: 'College Road, Nashik', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be' },
            { name: 'Shree Krishna Mess', owner: 'Rakesh Patil', mobile: '9765432189', city: 'Nashik', cuisine: 'Veg', price: 2600, address: 'Panchavati, Nashik', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
            { name: 'Annapurna Mess Nashik', owner: 'Kavita Deshmukh', mobile: '9890654321', city: 'Nashik', cuisine: 'Maharashtrian', price: 2900, address: 'Gangapur Road, Nashik', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' }
        ];

        for (const m of messesData) {
            await db.query(
                `INSERT INTO messes 
                (owner_id, mess_name, owner_name, mobile, address, city, cuisine, price_per_month, price_per_week, price_per_day, rating, is_active, mess_image) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    ownerId,
                    m.name,
                    m.owner,
                    m.mobile,
                    m.address,
                    m.city,
                    m.cuisine,
                    m.price,
                    Math.round(m.price / 4),
                    Math.round(m.price / 30),
                    4.0 + Math.random(),
                    true,
                    m.image
                ]
            );
            console.log(`✅ Seeded: ${m.name} in ${m.city}`);
        }

        console.log('✨ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
