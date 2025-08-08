import dotenv from 'dotenv';
dotenv.config();


export const config = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/load-tester',
    },
    queue: {
        loadTestJobs: 'load-tester-jobs',
        loadTestResults: 'load-tester-results'
    },
    APIPort: parseInt(process.env.API_PORT || '4000', 10)
}