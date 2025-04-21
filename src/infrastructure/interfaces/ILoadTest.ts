
export interface ILoadTest {
    url: string;
    requests: number;
    concurrency: number;
    result: {
      successCount: number;
      failedCount: number;
      requestsPerSecond: number;
      totalTime: {
        min: number;
        max: number;
        avg: number;
      };
      timeToFirstByte: {
        min: number;
        max: number;
        avg: number;
      };
      timeToLastByte: {
        min: number;
        max: number;
        avg: number;
      };
    };
    createdAt?: Date;
  }
  