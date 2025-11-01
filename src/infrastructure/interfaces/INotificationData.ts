export interface NotificationPayload {
    testId: string;
    status: 'completed' | 'failed';
    message: string;
    resultsUrl?: string;
}