export interface ILoadData {
    testId: string;
    targetUrl: string,
    numRequests: number,
    concurrency: number,
    method?: string,
    payload?: any,
    headers?: Record<string, string>,
    timeout?: number
}