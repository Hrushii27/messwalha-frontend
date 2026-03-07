import dotenv from 'dotenv';
dotenv.config();
import { db } from '../config/firebase.js';
import { hashPassword } from '../utils/bcrypt.js';

const messesData = [
    {
        name: "Nikam Mess",
        ownerName: "Savita Nikam",
        location: "Behind DYP College, Kasba Bawada, Kolhapur",
        contact: "7057165076",
        city: "Kolhapur",
        description: "Homely meals near DYP College."
    },
    {
        name: "Wavare Mess",
        ownerName: "Mina Wavare",
        location: "Dhangal Gali, Behind Shiv Temple, Kasba Bawada, Kolhapur",
        contact: "9322008818",
        city: "Kolhapur",
        description: "Traditional taste in Kasba Bawada."
    },
    {
        name: "Yadhav Mess",
        ownerName: "Yadhav",
        location: "Behind DYP College, Kasba Bawada, Kolhapur",
        contact: "Not Available",
        city: "Kolhapur",
        description: "Student-friendly mess behind DYP."
    },
    {
        name: "Sai Mess",
        ownerName: "Sai Owner",
        location: "Kasba Bawada, Kolhapur",
        contact: "Not Available",
        city: "Kolhapur",
        description: "Quality meals in Kasba Bawada."
    },
    {
        name: "Shree Ganesh Mess",
        ownerName: "Amit Patil",
        location: "FC Road, Pune",
        contact: "9823001122",
        city: "Pune",
        description: "Popular mess on FC Road."
    },
    {
        name: "Om Sai Tiffin Services",
        ownerName: "Ramesh Jadhav",
        location: "Karve Nagar, Pune",
        contact: "9765402211",
        city: "Pune",
        description: "Reliable tiffin service in Karve Nagar."
    },
    {
        name: "Annapurna Mess",
        ownerName: "Seema Kulkarni",
        location: "Kothrud, Pune",
        contact: "9096012345",
        city: "Pune",
        description: "Delicious Kothrud specialty."
    },
    {
        name: "Annapurna Mess (Mumbai)",
        ownerName: "Sunita Sharma",
        location: "Andheri East, Mumbai",
        contact: "9876543210",
        city: "Mumbai",
        description: "Authentic taste in Andheri."
    },
    {
        name: "Maa Durga Tiffin Center",
        ownerName: "Rajesh Gupta",
        location: "Dadar West, Mumbai",
        contact: "9898989898",
        city: "Mumbai",
        description: "Dadar's favorite tiffin center."
    },
    {
        name: "Shree Sai Mess",
        ownerName: "Manoj Yadav",
        location: "Vashi, Navi Mumbai",
        contact: "9768004455",
        city: "Navi Mumbai",
        description: "Quality food in Vashi."
    },
    {
        name: "Mahalaxmi Mess",
        ownerName: "Prakash Pawar",
        location: "Rajendra Nagar, Kolhapur",
        contact: "9011122233",
        city: "Kolhapur",
        description: "Serving Rajendra Nagar with pride."
    },
    {
        name: "Shivneri Mess",
        ownerName: "Deepak More",
        location: "Near Central Bus Stand, Kolhapur",
        contact: "9090909090",
        city: "Kolhapur",
        description: "Convenient location near CBS."
    }
];

const seedUserMesses = async () => {
    try {
        console.log('🚀 Starting user mess seeding...');

        if (!db) {
            throw new Error('Database not configured');
        }

        const password = await hashPassword('password123');

        for (const data of messesData) {
            // 1. Create Owner
            const email = `${data.ownerName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
            const userRef = db.collection('users').doc();
            const userData = {
                id: userRef.id,
                email,
                name: data.ownerName,
                password,
                role: 'OWNER',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await userRef.set(userData);

            // 2. Create Owner Subscription
            const subRef = db.collection('owner_subscriptions').doc();
            await subRef.set({
                id: subRef.id,
                ownerId: userRef.id,
                status: 'ACTIVE',
                planName: 'PREMIUM',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // 3. Create Mess
            const messRef = db.collection('messes').doc();
            await messRef.set({
                id: messRef.id,
                name: data.name,
                description: data.description,
                address: data.location,
                contact: data.contact,
                ownerId: userRef.id,
                city: data.city,
                rating: 4.0 + Math.random(),
                verified: true,
                monthlyPrice: 2000 + Math.floor(Math.random() * 1000),
                images: [
                    Math.random() > 0.5 ? '/messes/thali.png' : '/messes/curry.png',
                    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // 4. Create Menus
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const items = ['Roti', 'Dal', 'Rice', 'Bhaji', 'Salad'];
            for (const day of days) {
                const menuRef = db.collection('menus').doc();
                await menuRef.set({
                    id: menuRef.id,
                    messId: messRef.id,
                    day,
                    items,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            console.log(`✅ Seeded: ${data.name}`);
        }

        console.log('✨ All requested messes seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedUserMesses();
