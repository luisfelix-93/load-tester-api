import { Queue } from "bullmq";
import { config } from "../config";

const connectionOpts = {
    host: config.redis.host,
    port: config.redis.port,
};

export const loadTestJobsQueue = new Queue(config.queue.loadTestJobs, {connection: connectionOpts});