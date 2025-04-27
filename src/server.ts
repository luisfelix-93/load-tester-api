import express from 'express';
import { makeLoadTestRouter } from './routes/loadTest.route';
import { connectMongo } from './config/database';
import cors from 'cors';
const app = express();

app.use(cors({
    origin: '*' ,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/load-test', makeLoadTestRouter());
// connectMongo();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

