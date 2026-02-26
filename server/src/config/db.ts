import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.warn('⚠️  MONGODB_URI not set. Running without database persistence.');
        return false;
    }

    try {
        await mongoose.connect(uri, {
            dbName: 'live-polling',
        });
        console.log('✅ MongoDB Atlas connected successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        console.warn('⚠️  Continuing without database persistence.');
        return false;
    }
};
