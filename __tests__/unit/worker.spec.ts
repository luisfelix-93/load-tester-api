// __tests__/unit/LoadTesteWorker.spec.ts

import { Worker } from 'bullmq';
import { LoadTesteWorker } from '../../src/infrastructure/jobs/worker';
import { loadTestJobsQueue } from '../../src/infrastructure/jobs/queue';
import { LoadTestModel } from '../../src/infrastructure/models/LoadTestModel';
import { ILoadData } from '../../src/infrastructure/interfaces/ILoadData';
import { ILoadTest } from '../../src/infrastructure/interfaces/ILoadTest';

// Mock das dependências externas
jest.mock('bullmq');
jest.mock('../../src/infrastructure/jobs/queue', () => ({
  loadTestJobsQueue: {
    add: jest.fn(),
    name: 'load-test-jobs'
  }
}));
jest.mock('../../src/infrastructure/models/LoadTestModel', () => ({
  LoadTestModel: {
    create: jest.fn()
  }
}));

// Mock para a classe Worker do BullMQ
const MockedWorker = Worker as jest.MockedClass<typeof Worker>;
const mockedLoadTestJobsQueue = loadTestJobsQueue as jest.Mocked<typeof loadTestJobsQueue>;
const mockedLoadTestModel = LoadTestModel as jest.Mocked<typeof LoadTestModel>;

describe('LoadTesteWorker - Unit Tests', () => {
  let loadTesteWorker: LoadTesteWorker;

  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
    loadTesteWorker = new LoadTesteWorker();
  });

  // Testes para o método sendLoadTest
  describe('sendLoadTest', () => {
    it('deve adicionar um job à fila com os dados corretos', async () => {
      const testData: ILoadData = {
        testId: 'test-uuid-123',
        targetUrl: 'http://example.com',
        numRequests: 100,
        concurrency: 10,
        method: 'GET',
        payload: null,
        headers: {},
        timeout: 5000,
      };

      // Configura o mock para resolver a promessa
      mockedLoadTestJobsQueue.add.mockResolvedValue({} as any);

      await loadTesteWorker.sendLoadTest(testData);

      // Verifica se o método add foi chamado uma vez
      expect(mockedLoadTestJobsQueue.add).toHaveBeenCalledTimes(1);
      // Verifica se o método add foi chamado com os argumentos corretos
      expect(mockedLoadTestJobsQueue.add).toHaveBeenCalledWith('load-test-job', testData);
    });

    it('deve logar um erro se a adição do job falhar', async () => {
      const testData: ILoadData = { testId: 'test-uuid-456', targetUrl: 'http://fail.com', numRequests: 1, concurrency: 1, method: 'GET' };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const expectedError = new Error('Falha ao conectar no Redis');

      // Configura o mock para rejeitar a promessa com um erro
      mockedLoadTestJobsQueue.add.mockRejectedValue(expectedError);

      await loadTesteWorker.sendLoadTest(testData);

      // Verifica se o console.error foi chamado com a mensagem correta
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao buscar endpoints e agendar jobs:', expectedError);

      // Restaura a implementação original do console.error
      consoleErrorSpy.mockRestore();
    });
  });

  // Testes para o método loadTestResult
  describe('loadTestResult', () => {
    it('deve criar um Worker e processar um job com sucesso, salvando no banco', async () => {
        const jobData: ILoadTest = {
            testId: 'result-uuid-789',
            url: 'http://result.com',
            requests: 50,
            concurrency: 5,
            result: [ // Changed 'success' to 'completed' as per ILoadTest interface
                { n: 1, codeStatus: 200, responseTime: 100, status: 'completed' },
                { n: 2, codeStatus: 200, responseTime: 110, status: 'completed' },
            ],
            stats: {
                successCount: 48,
                failedCount: 2,
                requestsPerSecond: 10,
                totalTime: {
                    min: 80,
                    max: 200,
                    avg: 120,
                },
                timeToFirstByte: {
                    min: 10,
                    max: 50,
                    avg: 30,
                },
                timeToLastByte: {
                    min: 70,
                    max: 180,
                    avg: 100,
                },
            },
        };
        
        // Mock para o retorno do model
        mockedLoadTestModel.create.mockResolvedValue({} as any);

        // Captura o processador passado para o Worker
        let workerProcessor: (job: { data: ILoadTest }) => Promise<void>;
        MockedWorker.mockImplementation((name, processor, opts) => {
            workerProcessor = processor as any;
            return {} as Worker;
        });

        loadTesteWorker.loadTestResult();

        // Simula a execução do processador com um job
        await workerProcessor!({ data: jobData });

        // Verifica se o Worker foi instanciado corretamente
        expect(MockedWorker).toHaveBeenCalledTimes(1);

        // Verifica se o método create foi chamado com os dados corretos
        expect(mockedLoadTestModel.create).toHaveBeenCalledTimes(1);
        expect(mockedLoadTestModel.create).toHaveBeenCalledWith(expect.objectContaining({
            testId: jobData.testId,
            url: jobData.url,
            result: jobData.result,
        }));
    });

    it('deve logar um erro se a gravação no banco de dados falhar', async () => {
        const jobData: ILoadTest = { testId: 'result-uuid-error', url: 'http://db-fail.com', requests: 1, concurrency: 1, result: [], stats: { successCount: 0, failedCount: 0, requestsPerSecond: 0, totalTime: { min: 0, max: 0, avg: 0 }, timeToFirstByte: { min: 0, max: 0, avg: 0 }, timeToLastByte: { min: 0, max: 0, avg: 0 } } };
        const expectedError = new Error('Erro de banco de dados');
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Configura o mock para rejeitar a promessa
        mockedLoadTestModel.create.mockRejectedValue(expectedError);

        let workerProcessor: (job: { data: ILoadTest }) => Promise<void>;
        MockedWorker.mockImplementation((name, processor, opts) => {
            workerProcessor = processor as any;
            return {} as Worker;
        });

        loadTesteWorker.loadTestResult();

        await workerProcessor!({ data: jobData });

        expect(mockedLoadTestModel.create).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(`❌ Erro ao salvar log para endpoint ${jobData.url}:`, expectedError);
        
        consoleErrorSpy.mockRestore();
    });
  });
});
