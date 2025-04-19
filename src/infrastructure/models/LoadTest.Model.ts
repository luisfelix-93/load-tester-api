import mongoose, { Schema, Document } from 'mongoose';
import { ILoadTest } from '../interfaces/ILoadTest';

const LoadTestSchema = new Schema<ILoadTest>({
  url: { type: String, required: true },
  requests: { type
    : Number, required: true },
  concurrency: { type: Number, required: true },
  result: {
    successCount: { type: Number, required: true },
    failedCount: { type: Number, required: true },
    requestsPerSecond: { type: Number, required: true },
    totalTime: {
      min: Number,
      max: Number,
      avg: Number,
    },
    timeToFirstByte: {
      min: Number,
      max: Number,
      avg: Number,
    },
    timeToLastByte: {
      min: Number,
      max: Number,
      avg: Number,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

export const LoadTestModel = mongoose.model<ILoadTest>('LoadTest', LoadTestSchema);
