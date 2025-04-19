import { ILoadTest } from "../infrastructure/interfaces/ILoadTest";
import { ILoadTestRepository } from "../infrastructure/repositories/LoadTestRepository";

export interface ILoadTestService {
    saveTest(data: ILoadTest): Promise<ILoadTest>;
    listsTest(): Promise<ILoadTest[]>;
    getTestById(id: string): Promise<ILoadTest | null>;
}

export class LoadTestService implements ILoadTestService {
    constructor(private readonly repository: ILoadTestRepository) {}

    async saveTest(data: ILoadTest): Promise<ILoadTest> {
        return await this.repository.save(data);
    }

    async listsTest(): Promise<ILoadTest[]> {
        return await this.repository.findAll();
    }

    async getTestById(id: string): Promise<ILoadTest | null> {
        return await this.repository.findById(id);
    }
}