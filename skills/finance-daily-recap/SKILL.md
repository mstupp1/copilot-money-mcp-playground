---
name: finance-daily-recap
description: "Use when the user wants a daily spending recap, a yesterday spending summary, or a scheduled finance digest that compares recent spending to baseline and optionally sends the result to Telegram."
---

# Finance Daily Recap

Produce a compact daily spending recap that is useful enough to read every day. This is not a ledger. The job is to explain whether yesterday was normal, what drove it, and whether anything deserves attention.

Default style for this user:
- Crisp and analytical
- Summary-first, not transaction-by-transaction
- Send every day
- If there was no spend, keep it short, slightly funny, and encouraging
- Use clean Telegram-friendly formatting when it adds clarity
- Use bullets and tasteful emojis sparingly and only when they improve scanability

## Workflow

1. Read `skills/user-profile.md` first. Respect any communication or category preferences found there.

2. Use the user's local timezone. If the user says "yesterday," interpret it in their timezone. If no date is given, default to yesterday.

3. Pull yesterday's spending with `get_transactions`.
   Use:
   - `start_date` = target date
   - `end_date` = target date
   - `exclude_deleted` = true
   - `exclude_excluded` = true
   - `exclude_transfers` = true
   - a high enough `limit` to avoid truncation

4. Pull baseline history with `get_transactions` for the prior 56 days using the same filters. Use this history to build recent comparison context.

5. Do the arithmetic in the shell for anything larger than a handful of transactions or comparison days. Do not do multi-step aggregation mentally.

6. If the user asked for delivery, send the finished recap with Telegram after composing it.

## What To Compute

Always compute:
- Total spend for the target day
- Transaction count
- Pending transaction count
- Top category by dollars
- Top merchant by dollars, if meaningful

Also compute a baseline:
- Preferred baseline: the last 6 matching weekdays before the target date
- Fallback: the last 14 days if there are not enough matching weekdays
- Compare yesterday against the baseline average total spend

## Interpretation Rules

### Day Label

Use one label in the headline:
- `quiet` if yesterday is materially below baseline
- `typical` if it is near baseline
- `heavy` if it is materially above baseline
- `spiky` if one purchase dominates the day and explains most of the total

Use judgment, but these defaults are good:
- `quiet`: under 70% of baseline and at least $15 lower
- `typical`: roughly 70% to 130% of baseline
- `heavy`: over 130% of baseline and at least $20 higher
- `spiky`: one transaction is at least 60% of the day's total and the day is not otherwise high-volume

### Large Single Charge

Flag an unusually large single charge when either is true:
- It is at least 2x that merchant's recent typical amount, if the merchant appears in baseline history
- Otherwise, it is at least $75 and clearly dominates the day

Do not force a large-charge callout if the data is weak.

### Essential vs Discretionary

Classify the day at a high level:
- `mostly essential` if about 70% or more of spend is in essentials
- `mostly discretionary` if about 70% or more is in discretionary categories
- otherwise `mixed`

Use simple category heuristics.

Treat these as essential by default:
- groceries
- utilities
- rent or mortgage
- insurance
- medical
- gas
- commuting or transit
- phone or internet

Treat these as discretionary by default:
- dining
- bars
- coffee
- shopping
- entertainment
- hobbies
- subscriptions
- delivery
- travel or leisure

Treat ambiguous categories conservatively:
- If classification is unclear, say `mixed` instead of pretending certainty

## Message Rules

The recap should be brief. It should usually fit in 4-8 lines.

Do:
- Start with a simple heading that makes it clear the recap is from Copilot Money
- Lead with the headline: total, count, and label
- Add one comparison line against baseline
- Mention the top driver or top category
- Mention a large charge only if it is genuinely notable
- Mention essential vs discretionary only if it adds signal
- Mention pending transactions when present
- End with a takeaway only if it is meaningful
- Use simple line breaks and bullets when they make the message easier to scan
- Use at most 1-3 tasteful emojis when they clearly reinforce the content
- Prefer emojis with semantic value, like grocery, warning, or trend cues, rather than decoration

Do not:
- List every transaction by default
- Fill space with generic advice
- Force a takeaway when nothing stands out
- Sound like a budgeting app push notification
- Add emojis just to make the message feel lively
- Stack multiple emojis on the same line
- Turn every recap into a templated block of bullets if plain prose reads better

## Transaction Listing Policy

Only list individual transactions when they add information. Good reasons:
- There were only 1-3 transactions and naming them explains the whole day
- One merchant clearly drove the day
- A large charge or odd purchase is the point of the recap

Otherwise summarize by category and behavior shape.

## No-Spend Days

When there was no spend:
- Keep it very short
- Make it lightly funny
- Make it encouraging, but not corny

Example shape:

```text
Yesterday was quiet: $0 across 0 purchases.

No spending to report. Clean sheet. Your impulse control remains federally uninvestigated.
```

## Pending Handling

Include pending transactions in the recap when they are present, because the user wants daily awareness. But always mark that totals may shift until charges post.

Use wording like:
- `2 charges are still pending, so the final total may move a bit.`

Never imply that pending totals are fully settled.

## Output Template

Use this structure and adapt it to the data:

```text
Copilot Money Daily Recap

Yesterday was [quiet/typical/heavy/spiky]: $[total] across [count] purchases.

That was [below/near/above] your recent [weekday] baseline of $[baseline].

Main driver: [top category or merchant].
[Optional] One larger charge stood out: [merchant] at $[amount].
[Optional] The day was mostly [essential/discretionary/mixed].
[Optional] [N] charges are still pending, so the total may shift.

[Optional meaningful takeaway]
```

Formatting guidance:
- Keep the heading simple and stable, for example `Copilot Money Daily Recap`
- Plain text is fine when the day is simple
- Use bullets when there are 2-3 distinct drivers or flags worth separating
- Use emojis only where they carry meaning, for example:
  - a warning cue for an unusually large charge
  - a grocery or dining cue for the main driver
  - a trend cue for above or below baseline
- Keep emoji use restrained so the message still reads like a sharp personal briefing, not a cheerful app notification

## Telegram Delivery

If the user asks you to send the recap, or the workflow is running in an automation that expects delivery:
- Compose the message first
- Then send it with Telegram
- The Telegram message should be the same concise version, not a longer report

## Rules

1. Do not turn the recap into a ledger.
2. Prefer recent same-weekday comparison over generic daily averages.
3. Be selective about listing merchants.
4. Be honest when category or merchant interpretation is weak.
5. Keep no-spend days short and slightly playful.
6. If nothing is interesting, the message should still be useful because it is compact and grounded.
