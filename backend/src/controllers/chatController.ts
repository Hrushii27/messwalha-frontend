import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { db } from '../config/firebase.js';

export const getMyChats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const userId = req.user!.id;
        const chatsSnapshot = await db.collection('chats')
            .where('participants', 'array-contains', userId)
            .orderBy('updatedAt', 'desc')
            .get();

        const chats = await Promise.all(chatsSnapshot.docs.map(async (doc) => {
            const chatData = doc.data();

            // Parallel fetch for student and owner details
            const [studentDoc, ownerDoc, lastMsgSnapshot] = await Promise.all([
                db!.collection('users').doc(chatData.studentId).get(),
                db!.collection('users').doc(chatData.ownerId).get(),
                db!.collection('messages')
                    .where('chatId', '==', doc.id)
                    .orderBy('createdAt', 'desc')
                    .limit(1)
                    .get()
            ]);

            const lastMessage = !lastMsgSnapshot.empty ? lastMsgSnapshot.docs[0].data() : null;

            return {
                ...chatData,
                student: studentDoc.exists ? { id: studentDoc.id, name: studentDoc.data()!.name, avatar: studentDoc.data()!.avatar } : null,
                owner: ownerDoc.exists ? { id: ownerDoc.id, name: ownerDoc.data()!.name, avatar: ownerDoc.data()!.avatar } : null,
                messages: lastMessage ? [lastMessage] : []
            };
        }));

        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        next(error);
    }
};

export const getChatMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { chatId } = req.params;
        const userId = req.user!.id;

        const chatDoc = await db.collection('chats').doc(chatId as string).get();
        if (!chatDoc.exists) {
            return next(new AppError('Chat not found', 404));
        }

        const chat = chatDoc.data()!;
        if (chat.studentId !== userId && chat.ownerId !== userId) {
            return next(new AppError('Unauthorized', 403));
        }

        const messagesSnapshot = await db.collection('messages')
            .where('chatId', '==', chatId as string)
            .orderBy('createdAt', 'asc')
            .get();

        const messages = await Promise.all(messagesSnapshot.docs.map(async (doc) => {
            const msgData = doc.data();
            const senderDoc = await db!.collection('users').doc(msgData.senderId).get();
            return {
                ...msgData,
                sender: senderDoc.exists ? { id: senderDoc.id, name: senderDoc.data()!.name, avatar: senderDoc.data()!.avatar } : null
            };
        }));

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

export const createOrGetChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!db) return next(new AppError('Database not configured', 500));

        const { ownerId } = req.body;
        const studentId = req.user!.id;

        if (studentId === ownerId) {
            return next(new AppError('Cannot chat with yourself', 400));
        }

        const existingChatQuery = await db.collection('chats')
            .where('studentId', '==', studentId)
            .where('ownerId', '==', ownerId)
            .limit(1)
            .get();

        let chat;
        if (existingChatQuery.empty) {
            const chatRef = db.collection('chats').doc();
            chat = {
                id: chatRef.id,
                studentId,
                ownerId,
                participants: [studentId, ownerId],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await chatRef.set(chat);
        } else {
            chat = existingChatQuery.docs[0].data();
        }

        res.status(200).json({ success: true, data: chat });
    } catch (error) {
        next(error);
    }
};
