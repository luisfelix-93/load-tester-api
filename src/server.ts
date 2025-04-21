import express from 'express';
import { makeLoadTestRouter } from './routes/loadTest.route';
import { connectMongo } from './config/database';

const app = express();

app.use(express.json());

app.use('/load-test', makeLoadTestRouter());
connectMongo();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});