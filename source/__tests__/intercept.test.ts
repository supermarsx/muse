import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { interceptFetch, interceptXHR, Intercept } from '../intercept';

describe('interceptFetch', () => {
  const mockFetch = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), { status: 200 }),
  );
  let originalFetch: typeof window.fetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    window.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it('calls onRequest with url and method', async () => {
    const onRequest = vi.fn();
    const handle = interceptFetch({ onRequest });

    await window.fetch('https://example.com/api', { method: 'POST' });

    expect(onRequest).toHaveBeenCalledWith({
      url: 'https://example.com/api',
      method: 'POST',
    });

    handle.restore();
  });

  it('blocks the request when onRequest returns false', async () => {
    const onRequest = vi.fn().mockReturnValue(false);
    const handle = interceptFetch({ onRequest });

    const response = await window.fetch('https://example.com/blocked');

    expect(onRequest).toHaveBeenCalled();
    expect(response.status).toBe(0);
    expect(mockFetch).not.toHaveBeenCalled();

    handle.restore();
  });

  it('restore() restores the original fetch', async () => {
    const onRequest = vi.fn();
    const handle = interceptFetch({ onRequest });

    // While intercepted, fetch is patched
    expect(window.fetch).not.toBe(mockFetch);

    handle.restore();

    // After restore, calling fetch should no longer trigger onRequest
    onRequest.mockClear();
    await window.fetch('https://example.com/after-restore');
    expect(onRequest).not.toHaveBeenCalled();
  });

  it('works without onRequest or onResponse callbacks', async () => {
    const handle = interceptFetch({});

    await window.fetch('https://example.com/plain');

    expect(mockFetch).toHaveBeenCalledTimes(1);

    handle.restore();
  });

  it('calls onResponse with parsed JSON body', async () => {
    const onResponse = vi.fn();
    const handle = interceptFetch({ onResponse });

    await window.fetch('https://example.com/api');

    expect(onResponse).toHaveBeenCalledWith({
      url: 'https://example.com/api',
      status: 200,
      body: { ok: true },
    });

    handle.restore();
  });

  it('falls back to text body when JSON parse fails', async () => {
    const textFetch = vi.fn().mockResolvedValue(
      new Response('plain text', { status: 200, headers: { 'Content-Type': 'text/plain' } }),
    );
    window.fetch = textFetch;

    const onResponse = vi.fn();
    const handle = interceptFetch({ onResponse });

    await window.fetch('https://example.com/text');

    expect(onResponse).toHaveBeenCalledWith({
      url: 'https://example.com/text',
      status: 200,
      body: 'plain text',
    });

    handle.restore();
  });

  it('defaults method to GET when not specified', async () => {
    const onRequest = vi.fn();
    const handle = interceptFetch({ onRequest });

    await window.fetch('https://example.com/get');

    expect(onRequest).toHaveBeenCalledWith({
      url: 'https://example.com/get',
      method: 'GET',
    });

    handle.restore();
  });

  it('handles URL object input', async () => {
    const onRequest = vi.fn();
    const handle = interceptFetch({ onRequest });

    await window.fetch(new URL('https://example.com/url-obj'));

    expect(onRequest).toHaveBeenCalledWith({
      url: 'https://example.com/url-obj',
      method: 'GET',
    });

    handle.restore();
  });

  it('handles Request object input', async () => {
    const onRequest = vi.fn();
    const handle = interceptFetch({ onRequest });

    await window.fetch(new Request('https://example.com/req-obj'));

    expect(onRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://example.com/req-obj' }),
    );

    handle.restore();
  });
});

describe('interceptXHR', () => {
  it('calls onRequest when xhr.open is invoked', () => {
    const onRequest = vi.fn();
    const handle = interceptXHR({ onRequest });

    const xhr = new window.XMLHttpRequest();
    xhr.open('GET', 'https://example.com/data');

    expect(onRequest).toHaveBeenCalledWith({
      url: 'https://example.com/data',
      method: 'GET',
    });

    handle.restore();
  });

  it('calls onResponse with parsed JSON on load', () => {
    const onResponse = vi.fn();
    const handle = interceptXHR({ onResponse });

    const xhr = new window.XMLHttpRequest();
    xhr.open('GET', 'https://example.com/json');

    // Simulate response headers, body, and status
    const originalGetHeader = xhr.getResponseHeader.bind(xhr);
    xhr.getResponseHeader = (name: string) => {
      if (name === 'content-type') return 'application/json';
      return originalGetHeader(name);
    };
    Object.defineProperty(xhr, 'responseText', { value: '{"data":42}', writable: true });
    Object.defineProperty(xhr, 'status', { value: 200, writable: true });
    xhr.dispatchEvent(new Event('load'));

    expect(onResponse).toHaveBeenCalledWith({
      url: 'https://example.com/json',
      status: 200,
      body: { data: 42 },
    });

    handle.restore();
  });

  it('calls onResponse with text fallback when JSON parse fails', () => {
    const onResponse = vi.fn();
    const handle = interceptXHR({ onResponse });

    const xhr = new window.XMLHttpRequest();
    xhr.open('POST', 'https://example.com/text');

    // Simulate text/plain content type so the body is read
    const originalGetHeader = xhr.getResponseHeader.bind(xhr);
    xhr.getResponseHeader = (name: string) => {
      if (name === 'content-type') return 'text/plain';
      return originalGetHeader(name);
    };
    Object.defineProperty(xhr, 'responseText', { value: 'not json', writable: true });
    Object.defineProperty(xhr, 'status', { value: 200, writable: true });
    xhr.dispatchEvent(new Event('load'));

    expect(onResponse).toHaveBeenCalledWith({
      url: 'https://example.com/text',
      status: 200,
      body: 'not json',
    });

    handle.restore();
  });

  it('returns null body when content-type is not text/json', () => {
    const onResponse = vi.fn();
    const handle = interceptXHR({ onResponse });

    const xhr = new window.XMLHttpRequest();
    xhr.open('GET', 'https://example.com/binary');

    // No content-type header means body should stay null
    Object.defineProperty(xhr, 'responseText', { value: 'binary data', writable: true });
    Object.defineProperty(xhr, 'status', { value: 200, writable: true });
    xhr.dispatchEvent(new Event('load'));

    expect(onResponse).toHaveBeenCalledWith({
      url: 'https://example.com/binary',
      status: 200,
      body: null,
    });

    handle.restore();
  });

  it('handles URL object in xhr.open', () => {
    const onRequest = vi.fn();
    const handle = interceptXHR({ onRequest });

    const xhr = new window.XMLHttpRequest();
    xhr.open('GET', new URL('https://example.com/url-obj') as unknown as string);

    expect(onRequest).toHaveBeenCalledWith({
      url: 'https://example.com/url-obj',
      method: 'GET',
    });

    handle.restore();
  });

  it('restore() removes the interceptor and restores XHR when last', () => {
    // With the centralized registry, XHR is patched once and only restored
    // when all interceptors are removed. Save the global before any intercept.
    const savedXHR = window.XMLHttpRequest;
    const handle = interceptXHR({ onRequest: vi.fn() });

    handle.restore();

    // After removing the last interceptor, the original should be restored
    expect(window.XMLHttpRequest).toBe(savedXHR);
  });

  it('works without callbacks', () => {
    const handle = interceptXHR({});

    const xhr = new window.XMLHttpRequest();
    expect(() => xhr.open('POST', 'https://example.com/submit')).not.toThrow();

    handle.restore();
  });
});

describe('Intercept namespace', () => {
  it('maps interceptFetch correctly', () => {
    expect(Intercept.interceptFetch).toBe(interceptFetch);
  });

  it('maps interceptXHR correctly', () => {
    expect(Intercept.interceptXHR).toBe(interceptXHR);
  });
});
