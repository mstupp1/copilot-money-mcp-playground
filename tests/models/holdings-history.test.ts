/**
 * Unit tests for HoldingsHistoryMeta and HoldingsHistory schema validation.
 */

import { describe, test, expect } from 'bun:test';
import {
  HoldingsHistoryMetaSchema,
  HoldingsHistorySchema,
} from '../../src/models/holdings-history.js';

describe('HoldingsHistoryMetaSchema', () => {
  test('validates minimal document with just holdings_history_id', () => {
    const result = HoldingsHistoryMetaSchema.safeParse({
      holdings_history_id: 'abc123hash',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.holdings_history_id).toBe('abc123hash');
    }
  });

  test('validates full document with all fields', () => {
    const result = HoldingsHistoryMetaSchema.safeParse({
      holdings_history_id: 'abc123hash',
      account_id: 'acc-1',
      item_id: 'item-1',
      security_id: 'abc123hash',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.holdings_history_id).toBe('abc123hash');
      expect(result.data.account_id).toBe('acc-1');
      expect(result.data.item_id).toBe('item-1');
      expect(result.data.security_id).toBe('abc123hash');
    }
  });

  test('passes through unknown fields', () => {
    const result = HoldingsHistoryMetaSchema.safeParse({
      holdings_history_id: 'abc123hash',
      some_future_field: 'hello',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).some_future_field).toBe('hello');
    }
  });

  test('rejects missing holdings_history_id', () => {
    const result = HoldingsHistoryMetaSchema.safeParse({
      account_id: 'acc-1',
    });
    expect(result.success).toBe(false);
  });
});

describe('HoldingsHistorySchema', () => {
  test('validates minimal document with just history_id', () => {
    const result = HoldingsHistorySchema.safeParse({
      history_id: 'abc123hash:2025-01',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history_id).toBe('abc123hash:2025-01');
    }
  });

  test('validates full document with history data', () => {
    const result = HoldingsHistorySchema.safeParse({
      history_id: 'abc123hash:2025-01',
      security_id: 'abc123hash',
      account_id: 'acc-1',
      item_id: 'item-1',
      month: '2025-01',
      history: {
        '1706745600000': { price: 150.25, quantity: 10 },
        '1706832000000': { price: 151.0, quantity: 10 },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history_id).toBe('abc123hash:2025-01');
      expect(result.data.security_id).toBe('abc123hash');
      expect(result.data.month).toBe('2025-01');
      expect(result.data.history?.['1706745600000']?.price).toBe(150.25);
      expect(result.data.history?.['1706745600000']?.quantity).toBe(10);
      expect(result.data.history?.['1706832000000']?.price).toBe(151.0);
    }
  });

  test('validates history entries with partial data', () => {
    const result = HoldingsHistorySchema.safeParse({
      history_id: 'abc123hash:2025-01',
      history: {
        '1706745600000': { price: 150.25 },
        '1706832000000': { quantity: 10 },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history?.['1706745600000']?.price).toBe(150.25);
      expect(result.data.history?.['1706745600000']?.quantity).toBeUndefined();
      expect(result.data.history?.['1706832000000']?.quantity).toBe(10);
    }
  });

  test('passes through unknown fields', () => {
    const result = HoldingsHistorySchema.safeParse({
      history_id: 'abc123hash:2025-01',
      some_future_field: 'hello',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).some_future_field).toBe('hello');
    }
  });

  test('rejects missing history_id', () => {
    const result = HoldingsHistorySchema.safeParse({
      month: '2025-01',
    });
    expect(result.success).toBe(false);
  });
});
