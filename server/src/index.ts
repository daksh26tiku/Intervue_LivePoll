import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { connectDB } from './config/db';
import { httpServer } from './app';

const PORT = process.env.PORT || 3001;

const start = async () => {
    await connectDB();

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 Socket.io ready for connections`);
    });
};

start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
