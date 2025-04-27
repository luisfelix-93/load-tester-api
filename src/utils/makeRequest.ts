import { http, https } from 'follow-redirects';
import { URL } from 'url';

export async function makeRequest(url: string, timeout = 5000): Promise<{
  codeStatus: number;
  responseTime: number;
  timeToFirstByte?: number;
  timeToLastByte?: number;
  errorType?: string;
}> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObject = new URL(url);
    const lib = urlObject.protocol === 'https:' ? https : http;

    let firstByteTime: number | null = null;
    let isResolved = false;

    const req = lib.get(urlObject, (res) => {
      res.on('data', () => {
        if (firstByteTime === null) {
          firstByteTime = Date.now();
        }
      });

      res.on('end', () => {
        if (isResolved) return;
        isResolved = true;
        const endTime = Date.now();
        resolve({
          codeStatus: res.statusCode ?? 0,
          responseTime: endTime - startTime,
          timeToFirstByte: firstByteTime ? firstByteTime - startTime : undefined,
          timeToLastByte: firstByteTime ? endTime - firstByteTime : undefined,
        });
      });
    });

    req.setTimeout(timeout, () => {
      if (isResolved) return;
      isResolved = true;
      req.destroy();
      const endTime = Date.now();
      resolve({
        codeStatus: 408,
        responseTime: endTime - startTime,
        errorType: 'Timeout',
      });
    });

    req.on('error', (err: Error & { code?: string }) => {
      if (isResolved) return;
      isResolved = true;
      const endTime = Date.now();
      resolve({
        codeStatus: 500,
        responseTime: endTime - startTime,
        errorType: err.code || 'Unknown',
      });
    });
  });
}
