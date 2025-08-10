import { Request, Response } from 'express'
import { ILoadTestService } from '../services/LoadTestService';
import { ILoadTestWorker } from '../infrastructure/jobs/worker';
import { ILoadData } from '../infrastructure/interfaces/ILoadData';
import { v4 as uuidv4 } from 'uuid';


export class RunLoadTestController {
    constructor(
        private readonly service: ILoadTestService,
        private readonly worker: ILoadTestWorker
    ) {}

    async runLoadTest(req: Request, res: Response): Promise<void> {
        const data: Omit<ILoadData, 'testId'> = req.body;

        if (!data.targetUrl || !data.numRequests || !data.concurrency) {
            res.status(400).json({ error: 'Parâmetros são necessários para realizar o teste' });
            return;
        }

        const testId = uuidv4();

        try {
            await this.worker.sendLoadTest({...data, testId});

            res.status(202).json({ message: 'Teste de carga agendado com sucesso.', testId: testId });
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
