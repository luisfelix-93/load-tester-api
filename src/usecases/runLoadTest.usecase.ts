import { ILoadTest } from "../infrastructure/interfaces/ILoadTest";
import { ILoadTestService } from "../services/LoadTestService";
import { calcStats } from "../utils/calcStats";
import { makeRequest } from "../utils/makeRequest";

export interface IRunLoadTestUseCase {
    execute(targetUrl: string, numRequests: number, concurrency: number):Promise<ILoadTest>;
}

export class RunLoadTestUseCase implements IRunLoadTestUseCase{
    constructor(private readonly service: ILoadTestService){}

    async execute(targetUrl: string, numRequests: number, concurrency: number) {
        const stats: any[] = [];
        let requestSent = 0;
        const testStartTime = Date.now();

        async function worker() {
            while (requestSent < numRequests) {
                requestSent++;
                const stat = await makeRequest(targetUrl);
                stats.push(stat);
            }
        }

        const workers: Promise<void> [] = [];
        for (let i = 0; i < concurrency; i++) {
            workers.push(worker());
        }

        await Promise.all(workers);
        const testEndTime = Date.now();

        const totalTestTimeSeconds = (testEndTime - testStartTime) / 1000;
        const requestsPerSecond = numRequests / totalTestTimeSeconds;

        const successCount = stats.filter(s => s.statusCode && s.statusCode >= 200 && s.statusCode < 300).length;
        const failedCount = stats.length - successCount;

        const totalTimes = stats.map(s => s.totalTime / 1000);
        const ttfbTimes = stats.filter(s => s.timeToFirstByte !== undefined).map(s => (s.timeToFirstByte as number) / 1000);
        const ttlbTimes = stats.filter(s => s.timeToLastByte !== undefined).map(s => (s.timeToLastByte as number) / 1000);

        const result  = {
            successCount,
            failedCount,
            requestsPerSecond,
            totalTime: calcStats(totalTimes),
            timeToFirstByte: calcStats(ttfbTimes),
            timeToLastByte: calcStats(ttlbTimes)
        }
        const loadTestData : ILoadTest = {
            url: targetUrl,
            requests: numRequests,
            concurrency,
            result
        }
        await this.service.saveTest(loadTestData);

        return loadTestData;

    }
}