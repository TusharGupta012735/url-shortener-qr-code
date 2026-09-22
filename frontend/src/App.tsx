import { useState, type FormEvent } from 'react';
import { API_URL, APP_ENV, getQrCode, shortenUrl, toShortLink } from './lib/api';
import { getGuestId } from './lib/guest';
import './App.css';

interface LinkEntry {
  shortCode: string;
  originalUrl: string;
  shortLink: string;
  qr: string | null;
  qrLoading: boolean;
  qrError: string | null;
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const guestId = getGuestId();
      const result = await shortenUrl(normalizeUrl(originalUrl), guestId);
      setLinks((prev) => [
        {
          shortCode: result.shortUrl,
          originalUrl: result.url,
          shortLink: toShortLink(result.shortUrl),
          qr: null,
          qrLoading: false,
          qrError: null,
        },
        ...prev,
      ]);
      setOriginalUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async (shortCode: string, shortLink: string) => {
    try {
      await navigator.clipboard.writeText(shortLink);
      setCopiedCode(shortCode);
      setTimeout(() => setCopiedCode((c) => (c === shortCode ? null : c)), 1500);
    } catch {
      // clipboard API unavailable - ignore, link is still visible/selectable
    }
  };

  const handleGenerateQr = async (shortCode: string) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.shortCode === shortCode ? { ...l, qrLoading: true, qrError: null } : l,
      ),
    );
    try {
      const qr = await getQrCode(shortCode);
      setLinks((prev) =>
        prev.map((l) => (l.shortCode === shortCode ? { ...l, qr, qrLoading: false } : l)),
      );
    } catch (err) {
      setLinks((prev) =>
        prev.map((l) =>
          l.shortCode === shortCode
            ? {
                ...l,
                qrLoading: false,
                qrError: err instanceof Error ? err.message : 'Failed to load QR code',
              }
            : l,
        ),
      );
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>URL Shortener</h1>
        <span className={`env-badge env-${APP_ENV}`}>{APP_ENV}</span>
      </header>
      <p className="subtitle">Paste a link, shorten it, and generate a QR code.</p>

      <form className="shorten-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="https://example.com/some/long/link"
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !originalUrl.trim()}>
          {submitting ? 'Shortening…' : 'Shorten'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="link-list">
        {links.map((link) => (
          <li key={link.shortCode} className="link-card">
            <div className="link-card-original" title={link.originalUrl}>
              {link.originalUrl}
            </div>
            <div className="link-card-row">
              <code className="short-link">{link.shortLink}</code>
              <div className="link-card-actions">
                <button onClick={() => handleCopy(link.shortCode, link.shortLink)}>
                  {copiedCode === link.shortCode ? 'Copied' : 'Copy'}
                </button>
                <a className="button-link" href={link.shortLink} target="_blank" rel="noreferrer">
                  Visit
                </a>
                <button
                  onClick={() => handleGenerateQr(link.shortCode)}
                  disabled={link.qrLoading}
                >
                  {link.qrLoading ? 'Loading…' : link.qr ? 'Refresh QR' : 'Get QR'}
                </button>
              </div>
            </div>
            {link.qrError && <p className="error">{link.qrError}</p>}
            {link.qr && <img className="qr-image" src={link.qr} alt={`QR code for ${link.shortLink}`} />}
          </li>
        ))}
      </ul>

      <footer className="footer">Connected to {API_URL}</footer>
    </div>
  );
}

export default App;
