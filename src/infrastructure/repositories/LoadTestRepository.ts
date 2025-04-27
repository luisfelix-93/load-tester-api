import { ILoadTest } from "../interfaces/ILoadTest";

export interface ILoadTestRepository {
    save(loadTest: ILoadTest): Promise<ILoadTest>;
    findAll(): Promise<ILoadTest[]>;
    findById(id: string): Promise<ILoadTest | null>;
    findByDateRange(startDate: Date, endDate: Date): Promise<ILoadTest[]>;
}

export class LoadTestRepository implements ILoadTestRepository {
    private readonly tests: ILoadTest[] = [];

    async save(loadTest: ILoadTest): Promise<ILoadTest> {
        const newTest = {...loadTest, createdAt: new Date()};
        this.tests.push(newTest);
        return newTest;
    }

    async findAll(): Promise<ILoadTest[]> {
        return this.tests;
    }

    async findById(id: string): Promise<ILoadTest | null> {
        return this.tests.find(test => test._id === id) || null;
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<ILoadTest[]> {
        return this.tests.filter(test => test.createdAt && test.createdAt >= startDate && test.createdAt <= endDate);
    }
}