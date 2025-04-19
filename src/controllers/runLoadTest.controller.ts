import { Request, Response } from 'express'
import { IRunLoadTestUseCase } from '../usecases/runLoadTest.usecase';
import { ILoadTestService } from '../services/LoadTestService';

export class RunLoadTestController {
    constructor(
        private readonly useCase: IRunLoadTestUseCase,
        private readonly service: ILoadTestService
    ) {}

    async runLoadTest(req: Request, res: Response): Promise<void> {
        const { targetUrl, numRequests, concurrency } = req.body;
        if (!targetUrl || !numRequests || !concurrency) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        try {
            await this.useCase.execute(targetUrl, numRequests, concurrency);
            res.status(201).json({ message: 'Load test completed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `An error occurred while running the load test: ${error}` });
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
                res.status(404).json({ error: 'Load test not found' });
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
            res.status(500).json({ error: 'An error occurred while fetching load tests' });
        }
    }

}