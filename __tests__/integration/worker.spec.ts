
import { LoadTesteWorker } from '../../src/infrastructure/jobs/worker';
import { LoadTestModel } from '../../src/infrastructure/models/LoadTestModel';
import { ILoadTest } from '../../src/infrastructure/interfaces/ILoadTest';
import { config } from '../../src/infrastructure/config';
import mongoose from 'mongoose';
import { Queue, Worker } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

describe('LoadTesteWorker - Integration Tests', () => {
  let worker: Worker;
  let resultsQueue: Queue;

  beforeAll(async () => {
    // Conectar ao MongoDB de teste
    await mongoose.connect(config.mongo.uri, {});

    // Criar uma fila para enviar os resultados dos testes
    resultsQueue = new Queue(config.queue.loadTestResults, {
      connection: config.redis,
    });
  });

  afterAll(async () => {
    // Fechar a conexão com o MongoDB e Redis
    await mongoose.connection.close();
    await resultsQueue.close();
    if (worker) {
      await worker.close();
    }
  });

  beforeEach(async () => {
    // Limpar o banco de dados e a fila antes de cada teste
    await LoadTestModel.deleteMany({});
    await resultsQueue.drain(true);
  });

  it('deve processar um resultado da fila e salvar no banco de dados', async () => {
    // 1. Iniciar o worker para ouvir a fila de resultados
    const loadTesteWorker = new LoadTesteWorker();
    worker = loadTesteWorker.loadTestResult();

    // 2. Dados de teste que simulam um resultado de teste de carga
    const testResult: ILoadTest = {
      testId: uuidv4(),
      url: 'http://example.com',
      requests: 10,
      concurrency: 2,
      result: [
        { n: 1, codeStatus: 200, responseTime: 150, status: 'completed' },
      ],
      stats: {
        successCount: 10,
        failedCount: 0,
        requestsPerSecond: 5,
        totalTime: { min: 100, max: 200, avg: 150 },
        timeToFirstByte: { min: 50, max: 100, avg: 75 },
        timeToLastByte: { min: 100, max: 150, avg: 125 },
      },
    };

    // 3. Adicionar o resultado do teste à fila para o worker processar
    await resultsQueue.add('test-job', testResult);

    // 4. Aguardar um pouco para o worker processar o job
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Verificar se o resultado foi salvo no banco de dados
    const savedTest = await LoadTestModel.findOne({ testId: testResult.testId });

    expect(savedTest).toBeDefined();
    expect(savedTest?.url).toBe(testResult.url);
    expect(savedTest?.requests).toBe(testResult.requests);
    expect(savedTest?.stats?.successCount).toBe(testResult.stats.successCount);
  }, 10000); // Aumentar o timeout do teste para 10 segundos
});
