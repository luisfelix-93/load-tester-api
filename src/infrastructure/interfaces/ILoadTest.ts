
export interface ILoadTest {
    [x: string]: any;
    url: string;
    requests: number;
    concurrency: number;
    result: { 
      n: number; 
      codeStatus: number; 
      responseTime: number; 
      status: string;
    }[];
    stats: {
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
  