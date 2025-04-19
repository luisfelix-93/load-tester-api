import express from 'express';
import { makeLoadTestRouter } from './routes/loadTest.route';

const app = express();
app.use(express.json());

app.use('/load-test', makeLoadTestRouter());

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});