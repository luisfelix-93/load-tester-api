import { http, https } from 'follow-redirects';
import { URL } from 'url';

export interface MakeRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | string;
  headers?: Record<string, string>;
  payload?: any;
  timeout?: number;
}

export async function makeRequest(
  url: string,
  options: MakeRequestOptions = {},
): Promise<{
  codeStatus: number;
  responseTime: number;
  status: string;
  timeToFirstByte?: number;
  timeToLastByte?: number;
  errorType?: string;
}> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObject = new URL(url);
    const lib = urlObject.protocol === 'https:' ? https : http;

    const method = options.method?.toUpperCase() || 'GET';
    const timeout = options.timeout || 5000;
    const headers = { ...options.headers };

    // Se tiver payload, converte em JSON e ajusta headers

    let body: string | undefined;

    if (options.payload) {
      body = JSON.stringify(options.payload);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body).toString();
    }

    let firstByteTime: number | null = null;
    let isResolved = false;

    const req = lib.request({
      protocol: urlObject.protocol,
      hostname: urlObject.hostname,
      port: urlObject.port,
      path: urlObject.pathname + urlObject.search,
      method,
      headers,
    },
      (res) => {
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
            status: res.statusMessage ?? '',
            timeToFirstByte: firstByteTime ? firstByteTime - startTime : undefined,
            timeToLastByte: firstByteTime ? endTime - firstByteTime : undefined,
          });
        });
      }
    );
    req.setTimeout(timeout, () => {
      if (isResolved) return;
      isResolved = true;
      req.destroy();
      const endTime = Date.now();
      resolve({
        codeStatus: 408,
        responseTime: endTime - startTime,
        status: 'Request Timeout',
        errorType: 'Timeout',
      });
    });

    // Erro de conexão
    req.on('error', (err: Error & { code?: string }) => {
      if (isResolved) return;
      isResolved = true;
      const endTime = Date.now();
      resolve({
        codeStatus: 500,
        responseTime: endTime - startTime,
        status: err.message,
        errorType: err.code,
      });
    });

    // Se houver body, envia antes de encerrar
    if (body != null) {
      req.write(body);
    }
    req.end();
  });
}
