import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  transactionSchema,
  priceAlertSchema,
} from '../src/lib/validations';
import { formatCurrency, formatPercentage } from '../src/lib/formatters';

describe('Authentication & Validation Schemas', () => {
  it('validates correct login credentials', () => {
    const valid = loginSchema.safeParse({
      email: 'trader@cryptopulse.io',
      password: 'password123',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid email addresses in login', () => {
    const invalid = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(invalid.success).toBe(false);
  });

  it('rejects register when passwords do not match', () => {
    const mismatch = registerSchema.safeParse({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'differentPassword123',
    });
    expect(mismatch.success).toBe(false);
  });

  it('validates a valid crypto transaction payload', () => {
    const validTx = transactionSchema.safeParse({
      coin_id: 'bitcoin',
      coin_symbol: 'BTC',
      coin_name: 'Bitcoin',
      type: 'BUY',
      amount: 0.5,
      price_per_unit: 64000,
      transaction_date: '2026-09-30T12:00:00.000Z',
      notes: 'Dip buy',
    });
    expect(validTx.success).toBe(true);
  });

  it('rejects negative amounts in transactions', () => {
    const invalidTx = transactionSchema.safeParse({
      coin_id: 'bitcoin',
      coin_symbol: 'BTC',
      coin_name: 'Bitcoin',
      type: 'BUY',
      amount: -1,
      price_per_unit: 64000,
      transaction_date: '2026-09-30T12:00:00.000Z',
    });
    expect(invalidTx.success).toBe(false);
  });

  it('validates price alert creation', () => {
    const alert = priceAlertSchema.safeParse({
      coin_id: 'ethereum',
      coin_symbol: 'ETH',
      coin_name: 'Ethereum',
      target_price: 3000,
      condition: 'ABOVE',
    });
    expect(alert.success).toBe(true);
  });
});

describe('Formatters Utility', () => {
  it('formats standard currency correctly', () => {
    expect(formatCurrency(64250.5)).toBe('$64,250.50');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(null)).toBe('$0.00');
  });

  it('formats percentages with signs', () => {
    expect(formatPercentage(5.25)).toBe('+5.25%');
    expect(formatPercentage(-3.14)).toBe('-3.14%');
    expect(formatPercentage(0)).toBe('0.00%');
  });
});
