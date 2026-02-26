import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { db } from '../config/firebase.js';
import { logger } from './logger.js';

interface DecodedToken {
    id: string;
    role: string;
}

export const setupChatSocket = (io: Server) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;
            (socket as any).userId = decoded.id;
            (socket as any).userRole = decoded.role;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        logger.info(`User connected to chat: ${userId}`);

        socket.join(userId);

        socket.on('join_chat', (chatId: string) => {
            socket.join(chatId);
            logger.info(`User ${userId} joined chat room: ${chatId}`);
        });

        socket.on('send_message', async (data: { chatId: string; text?: string; image?: string }) => {
            try {
                if (!db) return;

                const { chatId, text, image } = data;

                // Fetch sender details
                const senderDoc = await db.collection('users').doc(userId).get();
                const senderData = senderDoc.exists ? senderDoc.data() : null;

                // Save message to database
                const messageRef = db.collection('messages').doc();
                const messageData = {
                    id: messageRef.id,
                    chatId,
                    senderId: userId,
                    text,
                    image,
                    createdAt: new Date(),
                    sender: senderData ? { name: senderData.name, avatar: senderData.avatar } : null
                };

                await messageRef.set(messageData);

                // Emit to all users in the chat room
                io.to(chatId).emit('new_message', messageData);

                // Update chat's updatedAt
                await db.collection('chats').doc(chatId).update({
                    updatedAt: new Date()
                });

                // Find the recipient to send a notification
                const chatDoc = await db.collection('chats').doc(chatId).get();
                if (chatDoc.exists) {
                    const chat = chatDoc.data()!;
                    const recipientId = userId === chat.studentId ? chat.ownerId : chat.studentId;
                    io.to(recipientId).emit('notification', {
                        type: 'CHAT',
                        title: 'New Message',
                        message: text || 'You have a new image message',
                        chatId,
                    });
                }
            } catch (error) {
                logger.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected from chat: ${userId}`);
        });
    });
};
