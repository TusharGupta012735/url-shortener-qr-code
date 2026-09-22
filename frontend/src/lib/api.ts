export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

export interface ShortenResult {
  url: string;
  shortUrl: string;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function shortenUrl(
  originalUrl: string,
  guestId: string,
): Promise<ShortenResult> {
  const res = await fetch(`${API_URL}/shortUrl/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl, guestId }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function getQrCode(shortCode: string): Promise<string> {
  const res = await fetch(`${API_URL}/qrCode/${shortCode}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export function toShortLink(shortCode: string): string {
  return `${API_URL}/shortUrl/${shortCode}`;
}
