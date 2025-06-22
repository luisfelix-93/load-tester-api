import { ILoadTest } from "../infrastructure/interfaces/ILoadTest";
import { ILoadTestService } from "../services/LoadTestService";
import { calcStats } from "../utils/calcStats";
import { makeRequest, MakeRequestOptions } from "../utils/makeRequest";
import { v4 as uuidv4 } from 'uuid';

export interface IRunLoadTestUseCase {
    execute(
        targetUrl: string, 
        numRequests: number, 
        concurrency: number,
        method?: string,
        payload?: any,
        headers?: Record<string, string>,
        timeout?: number
    ): Promise<ILoadTest>;
}

export class RunLoadTestUseCase implements IRunLoadTestUseCase {
    constructor(private readonly service: ILoadTestService) {}

    async execute(
        targetUrl: string, 
        numRequests: number, 
        concurrency: number,
        method: string = 'GET',
        payload?: any,
        headers?: Record<string, string>,
        timeout?: number
    ): Promise<ILoadTest> {
        const results: {
            n: number;
            codeStatus: number;
            responseTime: number;
            status: string;
            timeToFirstByte?: number;
            timeToLastByte?: number;
        }[] =[];

        let requestSent = 0;
        const testStartTime = Date.now();

        async function worker() {
            while (requestSent < numRequests) {
                const currentRequest = requestSent ++;
                const opts: MakeRequestOptions = { method, headers, payload, timeout}
                const stat = await makeRequest(targetUrl, opts);
                results.push({
                    n: currentRequest,
                    codeStatus: stat.codeStatus,
                    responseTime: stat.responseTime,
                    status: stat.status,
                    timeToFirstByte: stat.timeToFirstByte,
                    timeToLastByte: stat.timeToLastByte
                });
            }
        }

        const workers : Promise<void>[] =[];
        for (let i = 0; i < concurrency; i++) {
            workers.push(worker());
        }

        await Promise.all(workers);
        const testEndTime = Date.now();

        const totalTestTimeSeconds = (testEndTime - testStartTime) / 1000;
        const requestsPerSecond = numRequests / totalTestTimeSeconds;

        const successCount = results.filter(r => r.codeStatus >= 200 && r.codeStatus < 300).length;
        const failedCount = results.length - successCount;

        const totalTimes = results.map(r => r.responseTime / 1000);
        const ttfbTimes = results.filter(r => r.timeToFirstByte !== undefined).map(r => (r.timeToFirstByte as number) / 1000);
        const ttlbTimes = results.filter(r => r.timeToLastByte !== undefined).map(r => (r.timeToLastByte as number) / 1000);

        const stats = {
            successCount,
            failedCount,
            requestsPerSecond,
            totalTime: calcStats(totalTimes),
            timeToFirstByte: calcStats(ttfbTimes),
            timeToLastByte: calcStats(ttlbTimes)
        };

        const loadTestData: ILoadTest = {
            _id: uuidv4(),
            url: targetUrl,
            requests: numRequests,
            concurrency,
            result: results,
            stats,
            createdAt: new Date()
        };
        const loadTest = await this.service.saveTest(loadTestData);
        return loadTest;

    }
}