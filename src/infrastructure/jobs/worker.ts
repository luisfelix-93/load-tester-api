import { Worker } from "bullmq";
import { ILoadData } from "../interfaces/ILoadData";
import { ILoadTest } from "../interfaces/ILoadTest";
import { loadTestJobsQueue } from "./queue";
import { config } from "../config";
import { LoadTestModel } from "../models/LoadTestModel";

export interface ILoadTestWorker {
    sendLoadTest(data: ILoadData): Promise<void>;
    loadTestResult(): Worker<ILoadTest>;
}

export class LoadTesteWorker implements ILoadTestWorker {
    async sendLoadTest(data: ILoadData): Promise<void> {
        try {
            // A interface ILoadData já inclui o testId, então ele será enviado no job.
            await loadTestJobsQueue.add('load-test-job', {
                targetUrl: data.targetUrl,
                numRequests: data.numRequests,
                concurrency: data.concurrency,
                method: data.method,
                payload: data.payload,
                headers: data.headers,
                timeout: data.timeout,
                testId: data.testId
            }); 
            console.log(`➕ Job adicionado para a URL: ${data.targetUrl}, na fila ${loadTestJobsQueue.name}`);
        } catch (error) {
            console.error('Erro ao buscar endpoints e agendar jobs:', error);
        }
    }

    loadTestResult(): Worker<ILoadTest> {
        const connectionOpts = { host: config.redis.host, port: config.redis.port };
        console.log('👂 Ouvinte de resultados iniciado...');

        const worker = new Worker<ILoadTest>(config.queue.loadTestResults, async (job) => {
            // O resultado vindo do microsserviço deve conter o testId
            const result = job.data; 
            console.log(`💾 Recebido resultado para o testId: ${result.testId} (URL: ${result.url})`);
            try {
                await LoadTestModel.create({
                    testId: result.testId, // Salvando o testId
                    url: result.url,
                    requests: result.requests,
                    concurrency: result.concurrency,
                    result: result.result,
                    stats: result.stats,
                    createdAt: new Date()
                });
                console.log(`✅ Log para endpoint ${result.url} salvo com sucesso.`);
            } catch (error) {
                console.error(`❌ Erro ao salvar log para endpoint ${result.url}:`, error);
            }

        }, { connection: connectionOpts });

        return worker;
    }
}