---
name: finance-daily-recap
description: "Use when the user wants a daily spending recap, a yesterday spending summary, or a scheduled finance digest that compares recent spending to baseline. On Mondays, switch to a compact prior-week analysis instead of a normal daily recap."
---

# Finance Daily Recap

Produce a compact daily spending recap that is useful enough to read every day. This is not a ledger. The job is to explain whether yesterday was normal, what drove it, and whether anything deserves attention.

On Mondays, this skill should switch modes and produce a compact weekly-style analysis for the prior week instead of a normal single-day recap.

## Workflow

1. Read `skills/finance-base/SKILL.md` first for shared communication, formatting, delivery, and profile rules.

2. Read `skills/user-profile.md` first. Respect any communication or category preferences found there.

3. Use the user's local timezone. If the user says "yesterday," interpret it in their timezone. If no date is given, default to yesterday.

4. Determine the mode from the current day in the user's timezone:
   - Tuesday through Sunday: normal daily recap for yesterday
   - Monday: weekly-style analysis for the prior Monday through Sunday

   Monday should feel like a weekly briefing, not a stretched daily recap.

5. Pull the relevant spending window with `get_transactions`.
   Use:
   - daily mode: `start_date` = target date and `end_date` = target date
   - Monday mode: `start_date` = prior Monday and `end_date` = prior Sunday
   - `exclude_deleted` = true
   - `exclude_excluded` = true
   - `exclude_transfers` = true
   - a high enough `limit` to avoid truncation

6. Pull baseline history with `get_transactions` for the prior 56 days using the same filters. Use this history to build recent comparison context.

7. In Monday mode, if you need a stronger weekly baseline, pull enough history to compare against the last 4 completed weeks.

8. Do the arithmetic in the shell for anything larger than a handful of transactions or comparison days. Do not do multi-step aggregation mentally.

9. This workflow runs every day. If there was no spend, keep the recap very short, slightly funny, and encouraging.

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

## Monday Mode

If the current day is Monday in the user's timezone, switch to a weekly-style analysis for the prior Monday through Sunday.

In Monday mode, compute:
- Total spend for the full prior week
- Transaction count for the week
- Pending transaction count for the week
- Top 1-3 categories by dollars
- Largest single charge if meaningful
- Essential vs discretionary mix for the week

Weekly baseline:
- Preferred baseline: the last 4 completed weeks before the target week
- Compare the just-finished week against that average weekly spend

Message priorities in Monday mode:
- Frame it as a weekly briefing, not a daily recap
- Focus on the week's main drivers and shape
- Mention whether the week ran hot or cool versus recent weekly norm
- Mention the biggest category, and the biggest single charge only if it matters
- Add one takeaway only if the week shows a real pattern

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
- Start with the simple Copilot Money heading defined in `skills/finance-base/SKILL.md`
- Lead with the headline: total, count, and label
- Add one comparison line against baseline
- Mention the top driver or top category
- Mention a large charge only if it is genuinely notable
- Mention essential vs discretionary only if it adds signal
- Mention pending transactions when present
- End with a takeaway only if it is meaningful
- In Monday mode, make the message feel like a weekly briefing with slightly more synthesis and slightly less transaction detail
- Keep the message conversational when a list does not improve clarity
- If you list expenses, use a plain list rather than decorative labels or over-structured blocks

Do not:
- List every transaction by default
- Fill space with generic advice
- Force a takeaway when nothing stands out
- Turn simple spend mentions into bullets unless the bullets are doing real summary work

## Transaction Listing Policy

Only list individual transactions when they add information. Good reasons:
- There were only 1-3 transactions and naming them explains the whole day
- One merchant clearly drove the day
- A large charge or odd purchase is the point of the recap

Otherwise summarize by category and behavior shape.

When listing does help:
- Use a plain list of expenses
- Keep each line short and factual
- Do not add extra formatting unless the list itself is the summary

When listing does not help:
- Fold spend mentions into normal sentences
- Prefer conversational summary over a mechanical breakdown
- Mention only the one or two details that actually explain the day or week

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

In Monday mode, use this structure instead:

```text
Copilot Money Weekly Recap

Last week was [quiet/typical/heavy/spiky]: $[total] across [count] purchases.

That was [below/near/above] your recent weekly baseline of $[baseline].

Main drivers:
- [top category or merchant]
- [optional second driver]
[Optional] One larger charge stood out: [merchant] at $[amount].
[Optional] The week was mostly [essential/discretionary/mixed].
[Optional] [N] charges are still pending, so the total may shift.

[Optional meaningful takeaway]
```

Formatting guidance:
- Plain text is fine when the day is simple
- Use bullets when there are 2-3 distinct drivers or flags worth separating
- If bullets are used for expenses, keep them plain and utilitarian
- If emojis help, use them according to `skills/finance-base/SKILL.md`

## Rules

1. Do not turn the recap into a ledger.
2. Prefer recent same-weekday comparison over generic daily averages.
3. Be selective about listing merchants.
4. Be honest when category or merchant interpretation is weak.
5. Keep no-spend days short and slightly playful.
6. If nothing is interesting, the message should still be useful because it is compact and grounded.
7. On Mondays, favor a weekly view over a literal Sunday-only recap.
