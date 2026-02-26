import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import httpRoutes from './handlers/HttpRoutes';
import { setupPollSocketHandler } from './handlers/PollSocketHandler';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost'];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// REST routes
app.use('/api', httpRoutes);

// Socket.io handlers
setupPollSocketHandler(io);

export { httpServer, app, io };
