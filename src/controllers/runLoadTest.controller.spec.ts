import { Request, Response } from 'express';
import { RunLoadTestController } from './runLoadTest.controller';
import { IRunLoadTestUseCase } from '../usecases/runLoadTest.usecase';
import { ILoadTestService } from '../services/LoadTestService';

// Tipos para os nossos mocks de dependências
type MockUseCase = jest.Mocked<IRunLoadTestUseCase>;
type MockService = jest.Mocked<ILoadTestService>;

describe('RunLoadTestController', () => {
    let controller: RunLoadTestController;
    let mockUseCase: MockUseCase;
    let mockService: MockService;
    let mockRequest: Partial<Request>; // Usamos Partial<Request> para simular o objeto req
    let mockResponse: Partial<Response>; // Usamos Partial<Response> para simular o objeto res
    let responseJson: jest.Mock;
    let responseStatus: jest.Mock;

    beforeEach(() => {
        // ARRANGE - Configuração dos mocks para cada teste
        
        // Mock do UseCase com jest.fn() para cada método
        mockUseCase = {
            execute: jest.fn(),
        };

        // Mock do Service com jest.fn() para cada método
        mockService = {
            saveTest: jest.fn(), // Não é usado diretamente pelo controller, mas bom ter
            getTestById: jest.fn(),
            listsTest: jest.fn(),
            getTestByDateRange: jest.fn(),
        };

        // Mock dos objetos Request e Response do Express
        mockRequest = {};
        
        responseJson = jest.fn();
        // Essencial: faz com que res.status() retorne o próprio objeto res para permitir encadeamento (res.status().json())
        responseStatus = jest.fn().mockReturnValue({ json: responseJson });

        mockResponse = {
            status: responseStatus,
            json: responseJson,
        };

        // Instancia o controller com as dependências mockadas
        controller = new RunLoadTestController(mockUseCase, mockService);
        
        // Limpa chamadas anteriores para garantir que os testes sejam independentes
        jest.clearAllMocks();
    });

    // --- Testes para o método runLoadTest ---
    describe('runLoadTest', () => {
        it('should call the use case and return 201 on success', async () => {
            // Arrange
            const testData = {
                targetUrl: 'http://example.com',
                numRequests: 100,
                concurrency: 10,
            };
            mockRequest.body = testData;

            const useCaseResult = { _id: 'test-id-123', ...testData, result: [], stats: {} };
            mockUseCase.execute.mockResolvedValue(useCaseResult as any);

            // Act
            await controller.runLoadTest(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockUseCase.execute).toHaveBeenCalledWith(
                testData.targetUrl,
                testData.numRequests,
                testData.concurrency,
                'GET', // Valor padrão
                undefined,
                undefined,
                undefined
            );
            expect(responseStatus).toHaveBeenCalledWith(201);
            expect(responseJson).toHaveBeenCalledWith({
                message: 'Teste de carga completo com sucesso',
                data: useCaseResult,
                _id: useCaseResult._id,
            });
        });

        it('should return 400 if required parameters are missing', async () => {
            // Arrange
            mockRequest.body = { targetUrl: 'http://example.com' }; // Faltando numRequests e concurrency

            // Act
            await controller.runLoadTest(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockUseCase.execute).not.toHaveBeenCalled();
            expect(responseStatus).toHaveBeenCalledWith(400);
            expect(responseJson).toHaveBeenCalledWith({ error: 'Parâmetros são necessários para realizar o teste' });
        });

        it('should return 500 if the use case throws an error', async () => {
            // Arrange
            const testData = {
                targetUrl: 'http://example.com',
                numRequests: 100,
                concurrency: 10,
            };
            mockRequest.body = testData;
            const error = new Error('Execution failed');
            mockUseCase.execute.mockRejectedValue(error);

            // Act
            await controller.runLoadTest(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(responseStatus).toHaveBeenCalledWith(500);
            expect(responseJson).toHaveBeenCalledWith({ error: `Um erro ocorreu ao tentar realizar o teste de carga: ${error}` });
        });
    });

    // --- Testes para o método getLoadTestResults ---
    describe('getLoadTestResults', () => {
        it('should return 200 with test data if found', async () => {
            // Arrange
            const testId = 'test-id-456';
            mockRequest.params = { id: testId };
            const testResult = { _id: testId, url: 'http://example.com' };
            mockService.getTestById.mockResolvedValue(testResult as any);

            // Act
            await controller.getLoadTestResults(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockService.getTestById).toHaveBeenCalledWith(testId);
            expect(responseStatus).toHaveBeenCalledWith(200);
            expect(responseJson).toHaveBeenCalledWith(testResult);
        });
        
        it('should return 404 if test is not found', async () => {
            // Arrange
            const testId = 'non-existent-id';
            mockRequest.params = { id: testId };
            mockService.getTestById.mockResolvedValue(null);

            // Act
            await controller.getLoadTestResults(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockService.getTestById).toHaveBeenCalledWith(testId);
            expect(responseStatus).toHaveBeenCalledWith(404);
            expect(responseJson).toHaveBeenCalledWith({ error: 'Teste não encontrado' });
        });

        it('should return 500 if the service throws an error', async () => {
            // Arrange
            const testId = 'error-id';
            mockRequest.params = { id: testId };
            const error = new Error('Database error');
            mockService.getTestById.mockRejectedValue(error);
            
            // Act
            await controller.getLoadTestResults(mockRequest as Request, mockResponse as Response);
            
            // Assert
            expect(responseStatus).toHaveBeenCalledWith(500);
            expect(responseJson).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("Um erro aconteceu ao realizar o teste de carga") }));
        });
    });
    
    // --- Testes para o método getAllLoadTests ---
    describe('getAllLoadTests', () => {
        it('should return 200 with a list of all tests', async () => {
            // Arrange
            const allTests = [{ _id: '1' }, { _id: '2' }];
            mockService.listsTest.mockResolvedValue(allTests as any);
            
            // Act
            await controller.getAllLoadTests(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockService.listsTest).toHaveBeenCalledTimes(1);
            expect(responseStatus).toHaveBeenCalledWith(200);
            expect(responseJson).toHaveBeenCalledWith(allTests);
        });
    });

    // --- Testes para o método getTestsByDate ---
    describe('getTestsByDate', () => {
        it('should return 200 with tests within the date range', async () => {
            // Arrange
            const startDate = '2023-01-01T00:00:00.000Z';
            const endDate = '2023-01-31T23:59:59.999Z';
            mockRequest.query = { startDate, endDate };

            const tests = [{ _id: 'date-test-1' }];
            mockService.getTestByDateRange.mockResolvedValue(tests as any);

            // Act
            await controller.getTestsByDate(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockService.getTestByDateRange).toHaveBeenCalledWith(
                new Date(startDate),
                new Date(endDate)
            );
            expect(responseStatus).toHaveBeenCalledWith(200);
            expect(responseJson).toHaveBeenCalledWith(tests);
        });

        it('should return 400 if date parameters are missing', async () => {
            // Arrange
            mockRequest.query = { startDate: '2023-01-01' }; // Faltando endDate

            // Act
            await controller.getTestsByDate(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockService.getTestByDateRange).not.toHaveBeenCalled();
            expect(responseStatus).toHaveBeenCalledWith(400);
            expect(responseJson).toHaveBeenCalledWith({ error: 'É necessário fornecer data inicial e final' });
        });

        it('should return 400 for invalid date formats', async () => {
            // Arrange
            mockRequest.query = { startDate: 'not-a-date', endDate: '2023-01-31' };
            
            // Act
            await controller.getTestsByDate(mockRequest as Request, mockResponse as Response);

            // Assert
            expect(mockService.getTestByDateRange).not.toHaveBeenCalled();
            expect(responseStatus).toHaveBeenCalledWith(400);
            expect(responseJson).toHaveBeenCalledWith({ error: 'Formato de data inválido' });
        });
    });
});