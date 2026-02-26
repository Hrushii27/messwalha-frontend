import dotenv from 'dotenv';
dotenv.config();
import { db } from '../config/firebase.js';

const reviewsData = [
    { rating: 5, comment: "Excellent food! Very hygienic and tastes like home." },
    { rating: 4, comment: "Good quality meals at an affordable price. Highly recommended for students." },
    { rating: 5, comment: "Best mess in the area. The bhel on Sunday is a must-try!" },
    { rating: 3, comment: "Decent food, but sometimes it's a bit late. Overall good experience." },
    { rating: 4, comment: "Very friendly owner and the food is consistently good." },
    { rating: 5, comment: "Authentic Maharashtrian flavor! Love the Puran Poli." }
];

const seedReviews = async () => {
    try {
        console.log('🚀 Starting review seeding...');

        if (!db) {
            throw new Error('Database not configured');
        }

        // 1. Get all messes
        const messesSnapshot = await db.collection('messes').get();
        if (messesSnapshot.empty) {
            console.log('⚠️ No messes found to review.');
            process.exit(0);
        }

        // 2. Get some students
        const studentsSnapshot = await db.collection('users').where('role', '==', 'STUDENT').get();
        if (studentsSnapshot.empty) {
            console.log('⚠️ No students found to write reviews. Creating a sample student...');
            const studentRef = db.collection('users').doc();
            await studentRef.set({
                id: studentRef.id,
                name: "Trial Student",
                email: "student.trial@example.com",
                role: "STUDENT",
                createdAt: new Date()
            });
            // Re-fetch or just use this one
        }

        const students = (await db.collection('users').where('role', '==', 'STUDENT').get()).docs;

        for (const messDoc of messesSnapshot.docs) {
            const messId = messDoc.id;
            const messName = messDoc.data().name;

            // Add 2 random reviews for each mess
            const selectedReviews = reviewsData.sort(() => 0.5 - Math.random()).slice(0, 2);

            let totalRating = 0;

            for (let i = 0; i < selectedReviews.length; i++) {
                const review = selectedReviews[i];
                const student = students[i % students.length]; // Cycle through students

                const reviewRef = db.collection('reviews').doc();
                const reviewData = {
                    id: reviewRef.id,
                    userId: student.id,
                    messId,
                    rating: review.rating,
                    comment: review.comment,
                    images: [],
                    createdAt: new Date()
                };

                await reviewRef.set(reviewData);
                totalRating += review.rating;
            }

            // Update mess rating
            const avgRating = totalRating / selectedReviews.length;
            await db.collection('messes').doc(messId).update({
                rating: avgRating
            });

            console.log(`✅ Reviews added for: ${messName}`);
        }

        console.log('✨ All reviews seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedReviews();
