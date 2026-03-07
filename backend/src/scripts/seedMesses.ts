import { db } from '../config/firebase.js';

const seedData = async () => {
    console.log('--- SEED SCRIPT STARTING ---');
    if (!db) {
        console.error('❌ Database not initialized');
        return;
    }

    console.log('🚀 Starting Database Seeding...');

    try {
        // 1. Create Mock Owners
        const owners = [
            { id: 'owner_1', name: 'Rajesh Patil', email: 'rajesh@patilmess.com', role: 'OWNER' },
            { id: 'owner_2', name: 'Sandeep Sharma', email: 'sandeep@punjabexpress.com', role: 'OWNER' },
            { id: 'owner_3', name: 'Venkatesh Iyer', email: 'venky@dakshin.com', role: 'OWNER' },
        ];

        for (const owner of owners) {
            await db.collection('users').doc(owner.id).set({
                ...owner,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Create active subscription for each owner
            await db.collection('owner_subscriptions').doc(`sub_${owner.id}`).set({
                id: `sub_${owner.id}`,
                ownerId: owner.id,
                planName: 'PROFESSIONAL',
                status: 'ACTIVE',
                trialStartDate: new Date().toISOString(),
                trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                paymentStatus: 'SUCCESS',
                createdAt: new Date(),
            });
        }
        console.log('✅ Owners and Subscriptions seeded');

        // 2. Create Premium Messes
        const messes = [
            {
                name: 'Maratha Darbar (Elite)',
                description: 'Experience the authentic taste of Maharashtra with our premium thalis. Freshly prepared with traditional spices and organic ingredients. Home-like taste with restaurant-style hygiene.',
                address: 'Near COEP College, Shivaji Nagar, Pune',
                cuisine: 'MAHARASHTRIAN',
                contact: '+91 98234 56789',
                monthlyPrice: 3500,
                rating: 4.8,
                verified: true,
                ownerId: 'owner_1',
                images: [
                    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200',
                    'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=1200'
                ]
            },
            {
                name: 'Punjab Express',
                description: 'The ultimate destination for North Indian food lovers. We serve heavy butter naans, creamy dal makhani, and the best paneer masala in town. Unlimited lunch for students!',
                address: 'PICT College Road, Dhankawadi, Pune',
                cuisine: 'NORTH INDIAN',
                contact: '+91 91234 12345',
                monthlyPrice: 2800,
                rating: 4.5,
                verified: true,
                ownerId: 'owner_2',
                images: [
                    'https://images.unsplash.com/photo-1515516969-d4008cc6241a?q=80&w=1200',
                    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1200'
                ]
            },
            {
                name: 'Dakshin Delight',
                description: 'Pure authentic South Indian mess catering specifically to students. Idli, Dosa, and authentic Tamil-style sambar. Zero soda, zero artificial colors, 100% health.',
                address: 'Viman Nagar Market, Pune',
                cuisine: 'SOUTH INDIAN',
                contact: '+91 88776 65544',
                monthlyPrice: 2400,
                rating: 4.9,
                verified: true,
                ownerId: 'owner_3',
                images: [
                    'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?q=80&w=1200',
                    'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=1200'
                ]
            },
            {
                name: 'The Student Hub',
                description: 'A multi-cuisine budget friendly mess for engineering students. We offer a mix of Chinese, Veg, and Indian meals throughout the week. Fun environment and clean dining hall.',
                address: 'Bharati Vidyapeeth Campus, Katraj, Pune',
                cuisine: 'CHINESE',
                contact: '+91 77665 44332',
                monthlyPrice: 2200,
                rating: 4.2,
                verified: false,
                ownerId: 'owner_1',
                images: [
                    'https://images.unsplash.com/photo-1512058560374-181299a1362b?q=80&w=1200',
                    'https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1200'
                ]
            },
            {
                name: 'Homely Tiffin Service',
                description: 'Specializing in light, ghar-ka-khana for those who miss home. Low oil, low spice, and extremely hygienic. Perfect for everyday consumption.',
                address: 'Hinjewadi Phase 1, Near Infosys Circle',
                cuisine: 'VEG',
                contact: '+91 99001 12233',
                monthlyPrice: 3000,
                rating: 4.7,
                verified: true,
                ownerId: 'owner_2',
                images: [
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200',
                    'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=1200'
                ]
            }
        ];

        for (const mess of messes) {
            const messRef = db.collection('messes').doc();
            await messRef.set({
                id: messRef.id,
                ...mess,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        console.log('✅ Messes seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
