// Importando os tipos e a classe que vamos testar
import { RunLoadTestUseCase } from './runLoadTest.usecase';
import { IRunLoadTestUseCase } from './runLoadTest.usecase';
import { ILoadTest } from '../infrastructure/interfaces/ILoadTest';
import { ILoadTestService } from '../services/LoadTestService';

// Importando as dependências que serão mockadas
import { makeRequest } from '../utils/makeRequest';
import { calcStats } from '../utils/calcStats';
import { v4 as uuidv4 } from 'uuid';

// 1. MOCKANDO AS DEPENDÊNCIAS
// Mockamos o caminho para o módulo. O Jest interceptará qualquer importação desses módulos
// e nos fornecerá uma versão "mock" que podemos controlar.

// Mock para a função makeRequest
jest.mock('../utils/makeRequest');

// Mock para a função calcStats
jest.mock('../utils/calcStats');

// Mock para a biblioteca uuid
jest.mock('uuid');

// Criando tipos "mockados" para ter autocomplete e checagem de tipo
const mockedMakeRequest = makeRequest as jest.Mock;
const mockedCalcStats = calcStats as jest.Mock;
const mockedUuidv4 = uuidv4 as jest.Mock;

describe('RunLoadTestUseCase', () => {
    let service: ILoadTestService;
    let runLoadTestUseCase: RunLoadTestUseCase;

    // O bloco beforeEach é executado antes de cada teste ('it' block)
    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste para garantir que eles estejam isolados
        jest.clearAllMocks();

        // Arrange: Configuração do mock do serviço
        // Criamos um objeto que simula o ILoadTestService.
        // O método saveTest simplesmente retorna o que recebe, simulando um salvamento bem-sucedido.
        service = {
            saveTest: jest.fn().mockImplementation((data: ILoadTest) => Promise.resolve(data)),
            listsTest: jest.fn().mockResolvedValue([]),
            getTestById: jest.fn().mockResolvedValue(null),
            getTestByDateRange: jest.fn().mockResolvedValue([]),
        };

        // Arrange: Instanciando a classe sob teste com o serviço mockado
        runLoadTestUseCase = new RunLoadTestUseCase(service);
    });

    it('should execute a load test, calculate stats, and save the results successfully', async () => {
        // ARRANGE

        // Parâmetros para o teste
        const targetUrl = 'https://api.example.com';
        const numRequests = 10;
        const concurrency = 2;

        // Configurando o retorno dos mocks
        mockedUuidv4.mockReturnValue('mocked-uuid-1234');

        mockedMakeRequest.mockResolvedValue({
            codeStatus: 200,
            responseTime: 150, // 150ms
            status: 'Success',
            timeToFirstByte: 50,
            timeToLastByte: 100,
        });

        mockedCalcStats.mockReturnValue({
            total: 1.5,
            mean: 0.15,
            min: 0.1,
            max: 0.2,
            p50: 0.15,
            p95: 0.19,
            p99: 0.2,
        });
        
        // ACT
        // Executando o método principal
        const result = await runLoadTestUseCase.execute(targetUrl, numRequests, concurrency);

        // ASSERT

        // 1. Verificar se as funções mockadas foram chamadas corretamente
        expect(mockedUuidv4).toHaveBeenCalledTimes(1);
        expect(mockedMakeRequest).toHaveBeenCalledTimes(numRequests);
        
        // Verificamos se makeRequest foi chamado com a URL e opções corretas
        expect(mockedMakeRequest).toHaveBeenCalledWith(targetUrl, {
            method: 'GET',
            headers: undefined,
            payload: undefined,
            timeout: undefined
        });

        // Foi chamado 3 vezes: para totalTimes, ttfbTimes, e ttlbTimes
        expect(mockedCalcStats).toHaveBeenCalledTimes(3);

        // 2. Verificar se o serviço de salvamento foi chamado
        expect(service.saveTest).toHaveBeenCalledTimes(1);
        
        // 3. Usar um Snapshot para validar a estrutura e o conteúdo do objeto salvo
        // Na primeira vez que você rodar o teste, um arquivo de snapshot será criado.
        // Nas próximas, o Jest comparará o resultado com o snapshot salvo.
        // Isso é ótimo para objetos complexos.
        expect(service.saveTest).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: 'mocked-uuid-1234',
                url: targetUrl,
                requests: numRequests,
                concurrency: concurrency,
                result: expect.any(Array), // O array de resultados deve existir
                stats: expect.any(Object), // O objeto de stats deve existir
            })
        );
        
        // Verificação mais detalhada dos stats
        const savedData = (service.saveTest as jest.Mock).mock.calls[0][0];
        expect(savedData.stats.successCount).toBe(numRequests);
        expect(savedData.stats.failedCount).toBe(0);
        expect(savedData.result.length).toBe(numRequests);

        // 4. Verificar o retorno final da função
        expect(result).toBeDefined();
        expect(result._id).toBe('mocked-uuid-1234');
    });

    it('should correctly count successful and failed requests', async () => {
        // ARRANGE
        const numRequests = 5;
        const concurrency = 1;
        
        // Simulando 3 sucessos e 2 falhas
        mockedMakeRequest
            .mockResolvedValueOnce({ codeStatus: 200, responseTime: 100, status: 'Success' })
            .mockResolvedValueOnce({ codeStatus: 500, responseTime: 120, status: 'Error' })
            .mockResolvedValueOnce({ codeStatus: 201, responseTime: 110, status: 'Success' })
            .mockResolvedValueOnce({ codeStatus: 404, responseTime: 130, status: 'Error' })
            .mockResolvedValueOnce({ codeStatus: 204, responseTime: 90, status: 'Success' });
            
        mockedUuidv4.mockReturnValue('another-mocked-uuid');
        mockedCalcStats.mockReturnValue({}); // O retorno não importa para este teste

        // ACT
        await runLoadTestUseCase.execute('http://test.fail', numRequests, concurrency);

        // ASSERT
        expect(service.saveTest).toHaveBeenCalledTimes(1);

        // Pegando o argumento que foi passado para a função saveTest
        const savedData = (service.saveTest as jest.Mock).mock.calls[0][0];

        // Verificando a contagem de sucessos e falhas
        expect(savedData.stats.successCount).toBe(3);
        expect(savedData.stats.failedCount).toBe(2);
        expect(savedData.result.length).toBe(numRequests);
    });
});