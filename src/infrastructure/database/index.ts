import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

export async function connectMongoDB() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/load-tester-db';
    try {
        await mongoose.connect(mongoURI);
        console.log('Connectado ao MongoDB');
    } catch (error) {
        console.log('Erro ao conectar ao MongoDB: ', error)
    }
}