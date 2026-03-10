const db = require('../config/db');

const messData = [
    {
        "mess_name": "Nikam Mess",
        "owner_name": "Savita Nikam",
        "mobile": "7057165076",
        "price": "2500/month",
        "address": "Behind DYP College, Kasba Bawada, Kolhapur, Maharashtra"
    },
    {
        "mess_name": "Wavare Mess",
        "owner_name": "Mina Wavare",
        "mobile": "9322008818",
        "price": "2700/month",
        "address": "Dhangal Gali, Behind Shiv Temple, Kasba Bawada, Kolhapur"
    },
    {
        "mess_name": "Yadhav Mess",
        "owner_name": "Yadhav",
        "mobile": "9145236780",
        "price": "2400/month",
        "address": "Behind DYP College, Kasba Bawada, Kolhapur"
    },
    {
        "mess_name": "Sai Mess",
        "owner_name": "Ganesh Patil",
        "mobile": "9765021345",
        "price": "2300/month",
        "address": "Kasba Bawada, Kolhapur"
    },
    {
        "mess_name": "Shree Ganesh Mess",
        "owner_name": "Amit Patil",
        "mobile": "9823001122",
        "price": "3200/month",
        "address": "FC Road, Pune"
    },
    {
        "mess_name": "Annapurna Mess",
        "owner_name": "Seema Kulkarni",
        "mobile": "9096012345",
        "price": "3000/month",
        "address": "Kothrud, Pune"
    },
    {
        "mess_name": "Om Sai Tiffin Service",
        "owner_name": "Ramesh Jadhav",
        "mobile": "9765402211",
        "price": "2800/month",
        "address": "Karve Nagar, Pune"
    },
    {
        "mess_name": "Maa Durga Mess",
        "owner_name": "Rajesh Gupta",
        "mobile": "9898989898",
        "price": "3500/month",
        "address": "Dadar West, Mumbai"
    },
    {
        "mess_name": "Annapurna Tiffin Center",
        "owner_name": "Sunita Sharma",
        "mobile": "9876543210",
        "price": "3300/month",
        "address": "Andheri East, Mumbai"
    },
    {
        "mess_name": "Shree Sai Mess",
        "owner_name": "Manoj Yadav",
        "mobile": "9768004455",
        "price": "3100/month",
        "address": "Vashi, Navi Mumbai"
    },
    {
        "mess_name": "Konkan Home Mess",
        "owner_name": "Suresh Naik",
        "mobile": "9422056677",
        "price": "3500/month",
        "address": "Ponda, Goa"
    },
    {
        "mess_name": "Sai Krupa Mess",
        "owner_name": "Mahesh Gaonkar",
        "mobile": "9326123456",
        "price": "3300/month",
        "address": "Fatorda, Margao, Goa"
    },
    {
        "mess_name": "Shree Datta Mess",
        "owner_name": "Prakash Kamat",
        "mobile": "9767896543",
        "price": "3000/month",
        "address": "Mapusa Market Area, Goa"
    },
    {
        "mess_name": "Godavari Mess",
        "owner_name": "Sanjay Pawar",
        "mobile": "9822455566",
        "price": "2700/month",
        "address": "College Road, Nashik"
    },
    {
        "mess_name": "Shree Krishna Mess",
        "owner_name": "Rakesh Patil",
        "mobile": "9765432189",
        "price": "2600/month",
        "address": "Panchavati, Nashik"
    }
];

async function seedMesses() {
    try {
        console.log('🚀 Starting Bulk Mess Insertion...');

        // 1. Ensure 'city' column exists in 'mess_listings'
        console.log('Checking for city column...');
        await db.query(`
      DO $$ 
      BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='mess_listings' AND column_name='city') THEN
              ALTER TABLE mess_listings ADD COLUMN city VARCHAR(100);
          END IF;
      END $$;
    `);

        for (const data of messData) {
            console.log(`Processing: ${data.mess_name}...`);

            // 2. Extract price as number
            const priceValue = parseFloat(data.price.replace(/[^0-9.]/g, ''));

            // 3. Extract city from address
            let city = 'Other';
            const address = data.address.toLowerCase();
            if (address.includes('kolhapur')) city = 'Kolhapur';
            else if (address.includes('pune')) city = 'Pune';
            else if (address.includes('mumbai')) city = 'Mumbai';
            else if (address.includes('goa')) city = 'Goa';
            else if (address.includes('nashik')) city = 'Nashik';

            // 4. Check or Create Owner
            const email = `${data.owner_name.toLowerCase().replace(/\s+/g, '.')}@messwala.me`;
            let ownerId;

            const ownerCheck = await db.query('SELECT id FROM mess_owners WHERE email = $1', [email]);

            if (ownerCheck.rows.length === 0) {
                console.log(`Creating owner: ${data.owner_name}`);
                const newOwner = await db.query(
                    "INSERT INTO mess_owners (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                    [data.owner_name, email, data.mobile, '$2b$10$dummyhashformigration', 'OWNER']
                );
                ownerId = newOwner.rows[0].id;
            } else {
                ownerId = ownerCheck.rows[0].id;
            }

            // 5. Insert Mess Listing
            await db.query(`
        INSERT INTO mess_listings (
          mess_owner_id, 
          name, 
          address, 
          city,
          cuisine, 
          monthly_price, 
          description, 
          rating, 
          verified, 
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
                ownerId,
                data.mess_name,
                data.address,
                city,
                'Maharashtrian',
                priceValue,
                `Experience the authentic taste at ${data.mess_name}. Managed by ${data.owner_name}.`,
                4.5,
                true,
                true
            ]);

            console.log(`✅ Inserted ${data.mess_name} in ${city}`);
        }

        console.log('🎉 Bulk Insertion Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Insertion failed:', err);
        process.exit(1);
    }
}

seedMesses();
