import { describe, expect, it, vi } from 'vitest';
import { postAIChefRequest } from './aiChef';

describe('postAIChefRequest', () => {
  it('aborts the remote AI request when it exceeds the timeout', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })) as unknown as typeof fetch;

    try {
      const request = postAIChefRequest({
        token: 'anon-key',
        payload: { mode: 'fridge-rescue' },
        fetchImpl,
        timeoutMs: 100,
      });
      const expectation = expect(request).rejects.toThrow('AI Chef request timed out');

      await vi.advanceTimersByTimeAsync(101);

      await expectation;
      expect(fetchImpl).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
});
