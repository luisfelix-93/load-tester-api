import { ILoadTest } from "../infrastructure/interfaces/ILoadTest";
import { ILoadTestService } from "../services/LoadTestService";
import { makeRequest } from "../utils/makeRequest";
import { RunLoadTestUseCase } from "./runLoadTest.usecase";

jest.mock('../utils/makeRequest');

describe('RunLoadTestUseCase', () => {
    const mockService : ILoadTestService = {
        saveTest: jest.fn(),
        listsTest: jest.fn(),
        getTestById: jest.fn(),
        getTestByDateRange: jest.fn()
    };

    const mockMakRequest = makeRequest as jest.MockedFunction<typeof makeRequest>;

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('Deve executar teste de carga e salvar os resultados com sucesso', async ()=> {
        mockMakRequest.mockResolvedValue({
            codeStatus: 200,
            responseTime: 120,
            status: 'ok',
            timeToFirstByte: 30,
            timeToLastByte: 90
        });

        const  saveTestMock = mockService.saveTest as jest.Mock;
        saveTestMock.mockImplementation((test: ILoadTest) => Promise.resolve(test));
    
        const useCase = new RunLoadTestUseCase(mockService);
        const result = await useCase.execute('https://google.com', 3, 2);

        expect(result.url).toBe('https://google.com');
        expect(result.requests).toBe(3);
        expect(result.concurrency).toBe(2);
        expect(result.stats.successCount).toBe(3);
        expect(result.stats.failedCount).toBe(0);
        expect(result.stats.totalTime.avg).toBeDefined(); // ou qualquer campo dentro do totalTime, por exemplo        
    });
});