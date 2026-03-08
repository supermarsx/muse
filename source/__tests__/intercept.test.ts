import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Because the intercept module patches globals once and never restores them,
// we need to import a fresh module for each test. Use dynamic imports with
// vi.resetModules() to achieve this.
describe('interceptFetch', () => {
  const mockResponse = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const mockFetch = vi.fn().mockResolvedValue(mockResponse);
  let originalFetch: typeof window.fetch;

  beforeEach(() => {
    vi.resetModules();
    originalFetch = window.fetch;
    window.fetch = mockFetch;
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it('calls onRequest with url and method', async () => {
    const { interceptFetch } = await import('../intercept');
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
    const { interceptFetch } = await import('../intercept');
    const onRequest = vi.fn().mockReturnValue(false);
    const handle = interceptFetch({ onRequest });

    const response = await window.fetch('https://example.com/blocked');

    expect(onRequest).toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(mockFetch).not.toHaveBeenCalled();

    handle.restore();
  });

  it('restore() removes the interceptor callback', async () => {
    const { interceptFetch } = await import('../intercept');
    const onRequest = vi.fn();
    const handle = interceptFetch({ onRequest });

    // Fetch is now patched
    await window.fetch('https://example.com/before-restore');
    expect(onRequest).toHaveBeenCalledTimes(1);

    handle.restore();

    // After restore, the callback should not be called (patch stays but Set is empty)
    onRequest.mockClear();
    await window.fetch('https://example.com/after-restore');
    expect(onRequest).not.toHaveBeenCalled();
  });

  it('works without onRequest or onResponse callbacks', async () => {
    const { interceptFetch } = await import('../intercept');
    const handle = interceptFetch({});

    await window.fetch('https://example.com/plain');

    expect(mockFetch).toHaveBeenCalledTimes(1);

    handle.restore();
  });

  it('calls onResponse with parsed JSON body', async () => {
    const { interceptFetch } = await import('../intercept');
    const onResponse = vi.fn();
    const handle = interceptFetch({ onResponse });

    await window.fetch('https://example.com/api');

    // onResponse fires asynchronously — flush microtasks
    await new Promise((r) => setTimeout(r, 0));

    expect(onResponse).toHaveBeenCalledWith({
      url: 'https://example.com/api',
      status: 200,
      body: { ok: true },
    });

    handle.restore();
  });

  it('falls back to text body when JSON parse fails', async () => {
    const textFetch = vi
      .fn()
      .mockResolvedValue(new Response('plain text', { status: 200, headers: { 'Content-Type': 'text/plain' } }));
    window.fetch = textFetch;

    const { interceptFetch } = await import('../intercept');
    const onResponse = vi.fn();
    const handle = interceptFetch({ onResponse });

    await window.fetch('https://example.com/text');

    // onResponse fires asynchronously — flush microtasks
    await new Promise((r) => setTimeout(r, 0));

    expect(onResponse).toHaveBeenCalledWith({
      url: 'https://example.com/text',
      status: 200,
      body: 'plain text',
    });

    handle.restore();
  });

  it('defaults method to GET when not specified', async () => {
    const { interceptFetch } = await import('../intercept');
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
    const { interceptFetch } = await import('../intercept');
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
    const { interceptFetch } = await import('../intercept');
    const onRequest = vi.fn();
    const handle = interceptFetch({ onRequest });

    await window.fetch(new Request('https://example.com/req-obj', { method: 'PUT' }));

    expect(onRequest).toHaveBeenCalledWith({
      url: 'https://example.com/req-obj',
      method: 'PUT',
    });

    handle.restore();
  });

  it('extracts method from Request object when init is not provided', async () => {
    const { interceptFetch } = await import('../intercept');
    const onRequest = vi.fn();
    const handle = interceptFetch({ onRequest });

    await window.fetch(new Request('https://example.com/req-default'));

    expect(onRequest).toHaveBeenCalledWith({
      url: 'https://example.com/req-default',
      method: 'GET',
    });

    handle.restore();
  });

  it('throws when maximum number of fetch interceptors is reached', async () => {
    const { interceptFetch } = await import('../intercept');
    const handles: ReturnType<typeof interceptFetch>[] = [];

    // Register 100 interceptors (the max)
    for (let i = 0; i < 100; i++) {
      handles.push(interceptFetch({ onRequest: () => {} }));
    }

    // The 101st should throw
    expect(() => interceptFetch({ onRequest: () => {} })).toThrow(
      'Maximum number of fetch interceptors (100) reached.',
    );

    // Cleanup
    for (const h of handles) h.restore();
  });

  it('catches onRequest errors and continues to fetch', async () => {
    const { interceptFetch } = await import('../intercept');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onRequest = vi.fn(() => {
      throw new Error('onRequest boom');
    });
    const handle = interceptFetch({ onRequest });

    const response = await window.fetch('https://example.com/continue');

    expect(onRequest).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('[_muse] Fetch request interceptor error:', expect.any(Error));
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);

    handle.restore();
    warnSpy.mockRestore();
  });
});

describe('interceptXHR', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('calls onRequest when xhr.open is invoked', async () => {
    const { interceptXHR } = await import('../intercept');
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

  it('calls onResponse with parsed JSON on load', async () => {
    const { interceptXHR } = await import('../intercept');
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

  it('calls onResponse with text fallback when JSON parse fails', async () => {
    const { interceptXHR } = await import('../intercept');
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

  it('returns null body when content-type is not text/json', async () => {
    const { interceptXHR } = await import('../intercept');
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

  it('handles URL object in xhr.open', async () => {
    const { interceptXHR } = await import('../intercept');
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

  it('restore() removes the interceptor callback', async () => {
    const { interceptXHR } = await import('../intercept');
    const onRequest = vi.fn();
    const handle = interceptXHR({ onRequest });

    const xhr1 = new window.XMLHttpRequest();
    xhr1.open('GET', 'https://example.com/before');
    expect(onRequest).toHaveBeenCalledTimes(1);

    handle.restore();

    // After restore, the callback should not fire
    onRequest.mockClear();
    const xhr2 = new window.XMLHttpRequest();
    xhr2.open('GET', 'https://example.com/after');
    expect(onRequest).not.toHaveBeenCalled();
  });

  it('throws when maximum number of XHR interceptors is reached', async () => {
    const { interceptXHR } = await import('../intercept');
    const handles: ReturnType<typeof interceptXHR>[] = [];

    // Register 100 interceptors (the max)
    for (let i = 0; i < 100; i++) {
      handles.push(interceptXHR({ onRequest: () => {} }));
    }

    // The 101st should throw
    expect(() => interceptXHR({ onRequest: () => {} })).toThrow('Maximum number of XHR interceptors (100) reached.');

    // Cleanup
    for (const h of handles) h.restore();
  });

  it('works without callbacks', async () => {
    const { interceptXHR } = await import('../intercept');
    const handle = interceptXHR({});

    const xhr = new window.XMLHttpRequest();
    expect(() => xhr.open('POST', 'https://example.com/submit')).not.toThrow();

    handle.restore();
  });
});

describe('Intercept namespace', () => {
  it('maps interceptFetch and interceptXHR correctly', async () => {
    const { interceptFetch, interceptXHR, Intercept } = await import('../intercept');
    expect(Intercept.interceptFetch).toBe(interceptFetch);
    expect(Intercept.interceptXHR).toBe(interceptXHR);
  });
});
