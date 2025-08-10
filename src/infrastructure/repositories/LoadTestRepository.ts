import { ILoadTest } from "../interfaces/ILoadTest";
import { LoadTestModel } from "../models/LoadTestModel";

export interface ILoadTestRepository {
    save(loadTest: ILoadTest): Promise<ILoadTest>;
    findAll(): Promise<ILoadTest[]>;
    findById(id: string): Promise<ILoadTest | null>;
    findByDateRange(startDate: Date, endDate: Date): Promise<ILoadTest[]>;
}

export class LoadTestRepository implements ILoadTestRepository {
    async save(loadTest: ILoadTest): Promise<ILoadTest> {
        const doc = await LoadTestModel.create(loadTest);
        return doc.toObject() as ILoadTest;
    }

    async findAll(): Promise<ILoadTest[]> {
        return LoadTestModel.find().lean() as Promise<ILoadTest[]>;
    }

    async findById(id: string): Promise<ILoadTest | null> {
        return LoadTestModel.findOne({testId: id}).lean(id) as Promise<ILoadTest | null>;
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<ILoadTest[]> {
        return LoadTestModel.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).lean() as Promise<ILoadTest[]>;
    }
}