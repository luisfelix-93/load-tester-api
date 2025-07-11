import { Request, Response } from 'express'
import { IRunLoadTestUseCase } from '../usecases/runLoadTest.usecase';
import { ILoadTestService } from '../services/LoadTestService';

export class RunLoadTestController {
    constructor(
        private readonly useCase: IRunLoadTestUseCase,
        private readonly service: ILoadTestService
    ) {}

    async runLoadTest(req: Request, res: Response): Promise<void> {
        const { 
            targetUrl, 
            numRequests, 
            concurrency,
            method = 'GET',
            payload,
            headers,
            timeout
         } = req.body;
        if (!targetUrl || !numRequests || !concurrency) {
            res.status(400).json({ error: 'Parâmetros são necessários para realizar o teste' });
            return;
        }
        try {
            const loadTest = await this.useCase.execute(
                targetUrl, 
                numRequests, 
                concurrency,
                method,
                payload,
                headers,
                timeout
            );
            res.status(201).json({ message: 'Teste de carga completo com sucesso', data: loadTest, _id: loadTest._id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Um erro ocorreu ao tentar realizar o teste de carga: ${error}` });
        }
    }

    async getLoadTestResults(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ error: 'Impossível encontrar o teste de carga'});
        }
        try {
            const loadTestData = await this.service.getTestById(id);
            if (!loadTestData) {
                res.status(404).json({ error: 'Teste não encontrado' });
                return;
            }
            res.status(200).json(loadTestData);
        } catch (error) {
            console.error(error);
            res.status(500).json({error: `Um erro aconteceu ao realizar o teste de carga: ${error}`});
        }

    }

    async getAllLoadTests(req: Request, res: Response): Promise<void> {
        try {
            const loadTests = await this.service.listsTest();
            res.status(200).json(loadTests);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Um erro aconteceu ao realizar o teste de carga: ${error}`});
        }
    }

    async getTestsByDate(req: Request, res: Response): Promise<void> {
        const { startDate, endDate } = req.query;
    
        if (!startDate || !endDate) {
            res.status(400).json({ error: 'É necessário fornecer data inicial e final' });
            return;
        }
    
        try {
            const start = new Date(startDate as string);
            const end = new Date(endDate as string);
    
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                res.status(400).json({ error: 'Formato de data inválido' });
                return;
            }
    
            const tests = await this.service.getTestByDateRange(start, end);
            res.status(200).json(tests);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar testes por data' });
        }
    }

}