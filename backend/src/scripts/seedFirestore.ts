import dotenv from 'dotenv';
dotenv.config();
import { db } from '../config/firebase.js';
import { hashPassword } from '../utils/bcrypt.js';

const seed = async () => {
    try {
        console.log('🚀 Starting Firestore seeding...');

        if (!db) {
            throw new Error('Database not configured');
        }

        // 1. Create Owners
        const owners = [
            {
                email: 'owner1@example.com',
                password: 'password123',
                name: 'Rajesh Kumar',
                role: 'OWNER'
            },
            {
                email: 'owner2@example.com',
                password: 'password123',
                name: 'Priya Sharma',
                role: 'OWNER'
            }
        ];

        const ownerDocs = await Promise.all(owners.map(async (owner) => {
            const hashedPassword = await hashPassword(owner.password);
            const userRef = db!.collection('users').doc();
            const userData = {
                id: userRef.id,
                email: owner.email,
                password: hashedPassword,
                name: owner.name,
                role: owner.role,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await userRef.set(userData);

            // Create Owner Subscription
            const subRef = db!.collection('owner_subscriptions').doc();
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 60);

            await subRef.set({
                id: subRef.id,
                ownerId: userRef.id,
                planName: 'FREE_TRIAL',
                trialStartDate: new Date(),
                trialEndDate: trialEndDate,
                status: 'TRIAL',
                paymentStatus: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return userData;
        }));

        console.log('✅ Owners created');

        // 2. Create Messes
        const messes = [
            {
                name: 'Annapurna Mess',
                description: 'Authentic Maharashtrian and North Indian meals. Homemade quality.',
                address: '123, Model Colony, Pune',
                cuisine: 'North Indian',
                contact: '9876543210',
                ownerId: ownerDocs[0].id,
                rating: 4.5,
                verified: true,
                monthlyPrice: 2800,
                images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80']
            },
            {
                name: 'South Spice Corner',
                description: 'Best South Indian thalis and breakfast in the area.',
                address: '45, Kothrud, Pune',
                cuisine: 'South Indian',
                contact: '9876543211',
                ownerId: ownerDocs[1].id,
                rating: 4.2,
                verified: true,
                monthlyPrice: 2400,
                images: ['https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80']
            }
        ];

        const messDocs = await Promise.all(messes.map(async (mess) => {
            const messRef = db!.collection('messes').doc();
            const messData = {
                ...mess,
                id: messRef.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            await messRef.set(messData);
            return messData;
        }));

        console.log('✅ Messes created');

        // 3. Create Menus
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const items = ['Roti', 'Dal Tadka', 'Jeera Rice', 'Paneer Butter Masala', 'Salad', 'Curd'];

        for (const mess of messDocs) {
            await Promise.all(days.map(async (day) => {
                const menuRef = db!.collection('menus').doc();
                await menuRef.set({
                    id: menuRef.id,
                    messId: mess.id,
                    day,
                    items,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }));
        }

        console.log('✅ Menus created');

        // 4. Create Students
        const students = [
            {
                email: 'student1@example.com',
                password: 'password123',
                name: 'Amit Patel',
                role: 'STUDENT'
            }
        ];

        await Promise.all(students.map(async (student) => {
            const hashedPassword = await hashPassword(student.password);
            const userRef = db!.collection('users').doc();
            await userRef.set({
                id: userRef.id,
                email: student.email,
                password: hashedPassword,
                name: student.name,
                role: student.role,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }));

        console.log('✅ Students created');

        console.log('✨ Seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
