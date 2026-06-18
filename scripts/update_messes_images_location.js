const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/Admin/.gemini/antigravity/playground/sonic-pinwheel/messwalha/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const foodImages = [
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515516969-d4008cc6241a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=800&auto=format&fit=crop'
];

async function main() {
    try {
        console.log("Starting database cleanup and updates...");
        
        // 1. Fetch all messes
        const res = await pool.query('SELECT id, name, address, location, display_photo, image_url FROM mess_listings');
        console.log(`Fetched ${res.rows.length} mess listings.`);

        for (const row of res.rows) {
            let updateNeeded = false;
            let query = 'UPDATE mess_listings SET';
            const values = [];
            let paramIdx = 1;

            // Sync location with address
            if (!row.location && row.address) {
                query += ` location = $${paramIdx},`;
                values.push(row.address);
                paramIdx++;
                updateNeeded = true;
                console.log(`- Updating location for mess "${row.name}" (ID ${row.id})`);
            }

            // Sync display_photo and image_url if null
            if (!row.display_photo || !row.image_url) {
                const randomImage = foodImages[Math.floor(Math.random() * foodImages.length)];
                
                if (!row.display_photo) {
                    query += ` display_photo = $${paramIdx},`;
                    values.push(randomImage);
                    paramIdx++;
                }
                if (!row.image_url) {
                    query += ` image_url = $${paramIdx},`;
                    values.push(randomImage);
                    paramIdx++;
                }
                updateNeeded = true;
                console.log(`- Updating images for mess "${row.name}" (ID ${row.id})`);
            }

            if (updateNeeded) {
                // Trim trailing comma
                if (query.endsWith(',')) {
                    query = query.slice(0, -1);
                }
                query += ` WHERE id = $${paramIdx}`;
                values.push(row.id);
                
                await pool.query(query, values);
            }
        }

        console.log("Cleanup and updates completed successfully!");
    } catch (err) {
        console.error("Cleanup failed:", err);
    } finally {
        await pool.end();
    }
}

main();
