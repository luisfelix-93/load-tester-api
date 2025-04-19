import mongoose from "mongoose"

export const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGOURI || 'mongodb://localhost:27017/load-tester');
        console.log("Aplicação conectada no MongoDB corretamente");
    } catch (error) {
        console.error("Erro ao conectar no MongoDB", error);
        process.exit(1);
    }
}