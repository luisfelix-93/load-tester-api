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
        const statsRaw: any[] = [];
        const result: { n: number; codeStatus: number; responseTime: number}[] = []
        let requestSent = 0;
        const testStartTime = Date.now();

        async function worker() {
            while (requestSent < numRequests) {
                const currentRequest =  requestSent++;
                const startTime = Date.now()
                try {
                    const response = await fetch(targetUrl);
                    const endTime = Date.now();

                    result.push({
                        n: currentRequest,
                        codeStatus: response.status,
                        responseTime: endTime - startTime
                    });
                    statsRaw.push({
                        codeStatus: response.status,
                        totalTime: endTime - startTime,
                        timeToFirstByte: endTime - startTime, // simulação simplificada
                        timeToLastByte: endTime - startTime,
                    })
                } catch (error) {
                    const failTime = Date.now();
                    result.push({
                        n: currentRequest,
                        codeStatus: 0, // 0 indica erro de rede ou timeout
                        responseTime: failTime - startTime,
                    });

                    statsRaw.push({
                        statusCode: 0,
                        totalTime: failTime - startTime,
                    });
                }
            }
        }

        const workers: Promise<void> [] = [];
        for (let i = 0; i < concurrency; i++) {
            workers.push(worker());
        }

        await Promise.all(workers);
        const testEndTime = Date.now();
    
        const successCount = statsRaw.filter(s => s.statusCode >= 200 && s.statusCode < 300).length;
        const failedCount = statsRaw.length - successCount;

        const totalTestTimeSeconds = (testEndTime - testStartTime) / 1000;
        const requestsPerSecond = numRequests / totalTestTimeSeconds;

        const totalTimes = statsRaw.map(s => s.totalTime / 1000);
        const ttfbTimes = statsRaw.filter(s => s.timeToFirstByte !== undefined).map(s => (s.timeToFirstByte as number) / 1000);
        const ttlbTimes = statsRaw.filter(s => s.timeToLastByte !== undefined).map(s => (s.timeToLastByte as number) / 1000);

        const stats = {
            successCount,
            failedCount,
            requestsPerSecond,
            totalTime: calcStats(totalTimes),
            timeToFirstByte: calcStats(ttfbTimes),
            timeToLastByte: calcStats(ttlbTimes),
        };

        const loadTestData: ILoadTest = {
            url: targetUrl,
            requests: numRequests,
            concurrency,
            result,
            stats,
            createdAt: new Date(),
        };

    const loadTestSaved = await this.service.saveTest(loadTestData);

    return loadTestSaved;

    }
}