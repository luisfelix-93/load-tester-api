import mongoose, { Schema, Document, Model } from 'mongoose';
import { ILoadTest } from '../interfaces/ILoadTest';

// Subschemas para stats e result
const TimeStatsSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  avg: { type: Number, required: true }
}, { _id: false });

const StatsSchema = new Schema({
  successCount: { type: Number, required: true },
  failedCount: { type: Number, required: true },
  requestsPerSecond: { type: Number, required: true },
  totalTime: { type: TimeStatsSchema, required: true },
  timeToFirstByte: { type: TimeStatsSchema, required: true },
  timeToLastByte: { type: TimeStatsSchema, required: true }
}, { _id: false });

const ResultSchema = new Schema({
  n: { type: Number, required: true },
  codeStatus: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  status: { type: String, required: true },
  timeToFirstByte: { type: Number },
  timeToLastByte: { type: Number }
}, { _id: false });

const LoadTestSchema = new Schema<ILoadTest & Document>({
  url: { type: String, required: true },
  requests: { type: Number, required: true },
  concurrency: { type: Number, required: true },
  result: { type: [ResultSchema], required: true },
  stats: { type: StatsSchema, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const LoadTestModel: Model<ILoadTest & Document> = mongoose.model<ILoadTest & Document>('LoadTest', LoadTestSchema);