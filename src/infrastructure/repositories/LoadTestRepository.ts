import { Model } from "mongoose";
import { ILoadTest } from "../interfaces/ILoadTest";
import { LoadTestModel } from "../models/LoadTest.Model";

export interface ILoadTestRepository {
    save(loadTest: ILoadTest): Promise<ILoadTest>;
    findAll(): Promise<ILoadTest[]>;
    findById(id: string): Promise<ILoadTest | null>;
}

export class LoadTestRepository implements ILoadTestRepository {
    private model: Model<ILoadTest>;
    constructor(loadTestModel: Model<ILoadTest>) {
        this.model = loadTestModel;
    }

    async save(loadTest: ILoadTest): Promise<ILoadTest> {
        return await this.model.create(loadTest);
    }

    async findAll(): Promise<ILoadTest[]> {
        return await this.model.find().sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<ILoadTest | null> {
        return await this.model.findById(id);
    }
}