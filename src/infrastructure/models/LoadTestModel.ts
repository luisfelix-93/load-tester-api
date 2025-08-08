import mongoose, { Schema, Document, Model } from 'mongoose';
import { ILoadTest } from '../interfaces/ILoadTest';

const TimeStatsSchema = new Schema({
  min: { type: Number, required: true, default: 0 },
  max: { type: Number, required: true, default: 0 },
  avg: { type: Number, required: true, default: 0 }
}, { _id: false });

const StatsSchema = new Schema({
  successCount: { type: Number, required: true, default: 0 },
  failedCount: { type: Number, required: true, default: 0 },
  requestsPerSecond: { type: Number, required: true, default: 0 },
  totalTime: { type: TimeStatsSchema, required: true },
  timeToFirstByte: { type: TimeStatsSchema, required: true },
  timeToLastByte: { type: TimeStatsSchema, required: true }
}, { _id: false });

const ResultSchema = new Schema({
  n: { type: Number, required: true },
  codeStatus: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  status: { type: String, required: true, default: 'pending' },
  timeToFirstByte: { type: Number },
  timeToLastByte: { type: Number }
}, { _id: false });

const LoadTestSchema = new Schema<ILoadTest & Document>({
  testId: { type: String, required: true },
  url: { type: String, required: true },
  requests: { type: Number, required: true },
  concurrency: { type: Number, required: true },
  result: { type: [ResultSchema], required: true },
  stats: { type: StatsSchema, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const LoadTestModel: Model<ILoadTest & Document> = mongoose.model<ILoadTest & Document>('LoadTest', LoadTestSchema);