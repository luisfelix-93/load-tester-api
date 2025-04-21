import { http, https } from 'follow-redirects';
import { URL } from 'url';

export async function makeRequest(url: string) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObject = new URL(url);
    const lib = urlObject.protocol === 'https:' ? https : http;

    let firstByteTime: number | null = null;

    const req = lib.get(urlObject, (res) => {
      res.on('data', () => {
        if (firstByteTime === null) {
          firstByteTime = Date.now();
        }
      });

      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          statusCode: res.statusCode,
          totalTime: endTime - startTime,
          timeToFirstByte: firstByteTime ? firstByteTime - startTime : undefined,
          timeToLastByte: firstByteTime ? endTime - firstByteTime : undefined
        });
      });

      res.on('error', (error) => {
        const endTime = Date.now();
        resolve({
          error: error.message,
          totalTime: endTime - startTime,
        });
      });
    });

    req.on('error', (err) => {
      const endTime = Date.now();
      resolve({
        error: err.message,
        totalTime: endTime - startTime,
      });
    });
  });
}
