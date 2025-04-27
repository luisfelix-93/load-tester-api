import { Router } from 'express';
import { RunLoadTestController } from '../controllers/runLoadTest.controller';
import { RunLoadTestUseCase } from '../usecases/runLoadTest.usecase';
import { LoadTestService } from '../services/LoadTestService';
import { ILoadTestRepository, LoadTestRepository } from '../infrastructure/repositories/LoadTestRepository';


export class LoadTestRouter {
    public router: Router;

    constructor(controller: RunLoadTestController) {
        this.router = Router();
        this.setupRoutes(controller);
    }

    private setupRoutes (controller: RunLoadTestController) {
        this.router.post('/', controller.runLoadTest.bind(controller));
        this.router.get('/', controller.getAllLoadTests.bind(controller));
        this.router.get('/test/:id', controller.getLoadTestResults.bind(controller));
        this.router.get('/by-date', (req, res) => controller.getTestsByDate(req, res));

    }
}

export function makeLoadTestRouter() {
    const repository: ILoadTestRepository = new LoadTestRepository();
    const service: LoadTestService = new LoadTestService(repository);
    const useCase: RunLoadTestUseCase = new RunLoadTestUseCase(service);
    const controller: RunLoadTestController = new RunLoadTestController(useCase, service);
    const router = new LoadTestRouter(controller);
    return router.router;
}
