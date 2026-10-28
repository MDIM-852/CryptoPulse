import { describe, it, expect } from 'vitest';
import { rateLimit } from '../src/lib/ratelimit';

describe('Live Binance Feed & Rate Limiter Logic', () => {
  it('correctly parses and calculates miniTicker price percentages', () => {
    const rawTicker = {
      s: 'BTCUSDT',
      c: '65000.00',
      o: '62500.00',
    };

    const currentPrice = parseFloat(rawTicker.c);
    const openPrice = parseFloat(rawTicker.o);
    const priceChangePercent = ((currentPrice - openPrice) / openPrice) * 100;

    expect(priceChangePercent).toBe(4);
  });

  it('enforces in-memory sliding window rate limits', () => {
    const ip = 'test-client-ip-001';
    const limit = 5;
    const windowMs = 1000;

    // First 5 requests succeed
    for (let i = 0; i < limit; i++) {
      const result = rateLimit(ip, limit, windowMs);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(limit - 1 - i);
    }

    // 6th request fails with 429
    const exceeded = rateLimit(ip, limit, windowMs);
    expect(exceeded.success).toBe(false);
    expect(exceeded.remaining).toBe(0);
  });
});
