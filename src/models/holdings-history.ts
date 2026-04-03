/**
 * Holdings history models — historical price/quantity snapshots for investment holdings.
 *
 * Two Firestore patterns:
 * - items/{item_id}/accounts/{account_id}/holdings_history/{hash}
 *   Metadata for a holding snapshot series (the security hash).
 * - items/{item_id}/accounts/{account_id}/holdings_history/{hash}/history/{month}
 *   Epoch-ms keyed { price, quantity } entries for a given month.
 */

import { z } from 'zod';

export const HoldingsHistoryMetaSchema = z
  .object({
    holdings_history_id: z.string(), // doc ID (security hash)
    account_id: z.string().optional(),
    item_id: z.string().optional(),
    security_id: z.string().optional(),
  })
  .passthrough();

export type HoldingsHistoryMeta = z.infer<typeof HoldingsHistoryMetaSchema>;

export const HoldingsHistorySchema = z
  .object({
    history_id: z.string(), // constructed: {security_hash}:{month}
    security_id: z.string().optional(),
    account_id: z.string().optional(),
    item_id: z.string().optional(),
    month: z.string().optional(),
    history: z
      .record(
        z.string(),
        z
          .object({
            price: z.number().optional(),
            quantity: z.number().optional(),
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

export type HoldingsHistory = z.infer<typeof HoldingsHistorySchema>;
