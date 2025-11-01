import express from 'express';
import { makeLoadTestRouter } from './routes/loadTest.route';
import cors from 'cors';
import { connectMongoDB } from './infrastructure/database';
import { config } from './infrastructure/config';
import { metricsMiddleware } from './infrastructure/config/metrics';

async function startServer() {
    const app = express();

    await connectMongoDB();

    app.use(cors({
        origin: '*' ,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    app.use(express.json());

    app.use(metricsMiddleware);

    app.use('/load-test', makeLoadTestRouter());
    const PORT = config.APIPort;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}

startServer();

