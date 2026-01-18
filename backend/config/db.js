import mongoose from 'mongoose';

export const connectDB = async () => {
    const dbURI = process.env.MONGODB_URI;
    try {
        await mongoose.connect(dbURI);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};