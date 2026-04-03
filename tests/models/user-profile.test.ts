/**
 * Unit tests for UserProfile schema validation.
 */

import { describe, test, expect } from 'bun:test';
import { UserProfileSchema } from '../../src/models/user-profile.js';

describe('UserProfileSchema', () => {
  test('validates minimal document with just user_id', () => {
    const result = UserProfileSchema.safeParse({
      user_id: 'user-abc123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.user_id).toBe('user-abc123');
    }
  });

  test('validates full document with all fields', () => {
    const result = UserProfileSchema.safeParse({
      user_id: 'user-abc123',
      budgeting_enabled: true,
      authentication_required: false,
      data_initialized: true,
      onboarding_completed: true,
      logged_out: false,
      match_internal_txs_enabled: true,
      rollovers_enabled: false,
      investments_performance_initialized: true,
      finance_goals_monthly_summary_mode_enabled: false,
      public_id: 'pub-xyz789',
      last_cold_open: '2025-03-15T10:00:00Z',
      last_warm_open: '2025-03-15T14:30:00Z',
      last_month_reviewed: '2025-02',
      last_year_reviewed: '2024',
      account_creation_timestamp: '2024-01-10T08:00:00Z',
      onboarding_completed_timestamp: '2024-01-10T08:05:00Z',
      onboarding_last_completed_step: 'connect_accounts',
      service_ends_on_ms: 1735689600000,
      items_disconnect_on_ms: 1735776000000,
      intelligence_categories_review_count: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.user_id).toBe('user-abc123');
      expect(result.data.budgeting_enabled).toBe(true);
      expect(result.data.authentication_required).toBe(false);
      expect(result.data.data_initialized).toBe(true);
      expect(result.data.onboarding_completed).toBe(true);
      expect(result.data.public_id).toBe('pub-xyz789');
      expect(result.data.service_ends_on_ms).toBe(1735689600000);
      expect(result.data.intelligence_categories_review_count).toBe(5);
    }
  });

  test('passes through unknown fields', () => {
    const result = UserProfileSchema.safeParse({
      user_id: 'user-abc123',
      some_future_field: 'hello',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).some_future_field).toBe('hello');
    }
  });

  test('rejects missing user_id', () => {
    const result = UserProfileSchema.safeParse({
      budgeting_enabled: true,
      public_id: 'pub-xyz789',
    });
    expect(result.success).toBe(false);
  });
});
