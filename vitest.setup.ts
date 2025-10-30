import '@testing-library/jest-dom';

class MockResizeObserver {
  observe() {
    // no-op
  }

  unobserve() {
    // no-op
  }

  disconnect() {
    // no-op
  }
}

if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  // @ts-expect-error - define minimal ResizeObserver for tests
  window.ResizeObserver = MockResizeObserver;
}

if (typeof globalThis !== 'undefined' && !('ResizeObserver' in globalThis)) {
  // @ts-expect-error - define minimal ResizeObserver for tests
  globalThis.ResizeObserver = MockResizeObserver;
}

if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
}
