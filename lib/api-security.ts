import { NextResponse } from 'next/server';

/**
 * Adds security headers to API responses to discourage inspection
 * Note: This doesn't truly hide responses, but makes them less visible
 */
export function secureResponse<T>(data: T, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  
  // Add headers to discourage inspection
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Cache control to prevent caching sensitive data
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

/**
 * Obfuscates sensitive data in responses
 * Note: This is not encryption, just makes it harder to read
 */
export function obfuscateResponse(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = ['secret', 'password', 'token', 'key', 'apiSecret', 'apiKey'];
  const obfuscated = { ...data };

  for (const key in obfuscated) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      obfuscated[key] = '***REDACTED***';
    } else if (typeof obfuscated[key] === 'object') {
      obfuscated[key] = obfuscateResponse(obfuscated[key]);
    }
  }

  return obfuscated;
}

