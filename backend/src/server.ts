import { config } from './config/environment.js';
import app from './app.js';
import { logger } from './utils/logger.js';
import http from 'http';
import { Server } from 'socket.io';
import { setupChatSocket } from './utils/chatSocket.js';
import { checkExpiredTrials } from './utils/cronJobs.js';
import './config/firebase.js'; // Initialize Firebase Admin

const server = http.createServer(app);

// Schedule trial expiry check (Every 24 hours)
setInterval(checkExpiredTrials, 24 * 60 * 60 * 1000);
// Also run it on startup
checkExpiredTrials();

const io = new Server(server, {
    cors: {
        origin: config.FRONTEND_URL,
        methods: ['GET', 'POST'],
    },
});

setupChatSocket(io);

const PORT = config.PORT;

server.listen(PORT, async () => {
    logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});
