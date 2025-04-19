import { Router } from 'express';
import { RunLoadTestController } from '../controllers/runLoadTest.controller';
import { RunLoadTestUseCase } from '../usecases/runLoadTest.usecase';
import { LoadTestService } from '../services/LoadTestService';
import { ILoadTest } from '../infrastructure/interfaces/ILoadTest';
import { LoadTestModel } from '../infrastructure/models/LoadTest.Model';
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
        this.router.get('/:id', controller.getLoadTestResults.bind(controller));
    }
}

export function makeLoadTestRouter() {
    const repository: ILoadTestRepository = new LoadTestRepository(LoadTestModel);
    const service: LoadTestService = new LoadTestService(repository);
    const useCase: RunLoadTestUseCase = new RunLoadTestUseCase(service);
    const controller: RunLoadTestController = new RunLoadTestController(useCase, service);
    const router = new LoadTestRouter(controller);
    return router.router;
}
