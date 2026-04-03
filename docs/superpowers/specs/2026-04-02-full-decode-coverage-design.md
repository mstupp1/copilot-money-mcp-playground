# Full Decode Coverage Design

**Goal:** Decode 100% of documents in the LevelDB cache (currently 55.3%).

**Approach:** Add Zod schemas, model files, decoder processors, and integration into `decodeAllCollections` for all 23 remaining collection patterns. One small PR per logical collection, stacked sequentially.

**Baseline:** 30,941 / 55,953 documents decoded (55.3%), 12/35 collection patterns.

## Architecture Per Collection

1. **Model file** (`src/models/{name}.ts`) — Zod schema with `.passthrough()`, TypeScript type export
2. **Decoder processor** (`src/core/decoder.ts`) — `process{Name}()` function
3. **Integration** — Add to `AllCollectionsResult`, wire into if/else chain, dedup logic
4. **Re-export** from `src/models/index.ts`
5. **Tests** — Schema validation tests
6. **Coverage script** — Update `isDecoded()` in `scripts/decode-coverage.ts`

No MCP tool changes.

## PR Sequence (1 collection per PR, ordered by impact)

| # | PR | Collection Pattern(s) | Docs | Cumulative % |
|---|----|-----------------------|------|-------------|
| 1 | `feat: decode investment-performance` | `investment_performance/*`, `investment_performance`, `investment_performance/*/twr_holding` | 9,235 | ~71.8% |
| 2 | `feat: decode plaid-account` | `items/*/accounts/*` | 6,962 | ~84.3% |
| 3 | `feat: decode balance-history` | `items/*/accounts/*/balance_history` | 4,968 | ~93.1% |
| 4 | `feat: decode items/* routing` | `items/*` | 701 | ~94.4% |
| 5 | `feat: decode changes` | `changes/*`, `changes/*/t`, `changes/*/a` | 1,987 | ~97.9% |
| 6 | `feat: decode holdings-history` | `items/*/accounts/*/holdings_history/*`, `.../history` | 753 | ~99.3% |
| 7 | `feat: decode securities` | `securities` | 17 | ~99.3% |
| 8 | `feat: decode user-profile` | `users`, `users/*` | 229 | ~99.7% |
| 9 | `feat: decode tags` | `users/*/tags` | 8 | ~99.7% |
| 10 | `feat: decode amazon` | `amazon/*`, `amazon/*/orders` | 144 | ~100% |
| 11 | `feat: decode app-metadata` | `subscriptions`, `invites`, `user_items`, `feature_tracking`, `support`, `users/*/financial_goals/*` | 8 | 100% |

Notes:
- PR 1 bundles 3 related investment_performance patterns into one model file (they share a domain)
- PR 5 bundles 3 changes patterns (parent + 2 subcollections, same domain)
- PR 11 bundles 6 tiny collections (1-2 docs each) into one PR to avoid noise
- PR 4 may be a routing fix only (items at different key depth)

## Implementation Pattern

```typescript
// Model: src/models/security.ts
export const SecuritySchema = z.object({
  security_id: z.string(),
  ticker_symbol: z.string().optional(),
  name: z.string().optional(),
  // ...
}).passthrough();

export type Security = z.infer<typeof SecuritySchema>;
```

```typescript
// Decoder: process function
function processSecurity(
  fields: Map<string, FirestoreValue>,
  docId: string
): Security | null {
  const data: Record<string, unknown> = { security_id: docId };
  for (const field of ['ticker_symbol', 'name', 'type']) {
    const value = getString(fields, field);
    if (value) data[field] = value;
  }
  const result = SecuritySchema.safeParse(data);
  return result.success ? result.data : null;
}
```

## Decoder Routing Order

More specific paths first, then general. The if/else chain order in `decodeAllCollections()`:

```
// Deeply nested first
holdings_history/*/history → processHoldingsHistory
holdings_history/* → processHoldingsHistoryMeta
balance_history → processBalanceHistory
items/*/accounts/* (4-segment) → processPlaidAccount
items/*/accounts (listing) → already decoded

// Existing user checks
users/*/accounts → processUserAccount (existing)
users/*/tags → processTag
users/*/financial_goals/* → processFinancialGoalParent
users/* (profile) → processUserProfile
users → processUserProfile

// Existing collection checks
transactions → processTransaction (existing)
accounts → processAccount (existing)
recurring, budgets, financial_goals, financial_goal_history → existing
investment_prices → existing
investment_splits → existing
items → existing
categories → existing

// New additions
investment_performance/*/twr_holding → processTwrHolding
investment_performance/* → processInvestmentPerformance
investment_performance → processInvestmentPerformanceMeta
securities → processSecurity
changes/*/t → processTransactionChange
changes/*/a → processAccountChange
changes/* → processChange
amazon/*/orders → processAmazonOrder
amazon/* → processAmazonIntegration
subscriptions → processSubscription
invites → processInvite
user_items → processUserItems
feature_tracking → processFeatureTracking
support → processSupport
```

## Success Criteria

- `bun run scripts/decode-coverage.ts` reports 100% (0 remaining)
- All existing tests pass
- New schema tests for each collection
- No MCP tool regressions
