# Lead scoring rubric (edit weights to match your strategy)

Score each agent 0–100.

| Factor | Weight | How to score |
|---|---|---|
| 12-month closed volume ($) | 40% | Percentile rank among agents in the list. Agents in the top 2% get capped at 70% of this factor (hard to win, already served). |
| Momentum | 25% | Last 6 months vs. prior 6 months transaction count. Growth = higher score. |
| Price-point fit | 20% | Full points if avg sale price is $500k–$1.2M; scale down outside that band. |
| Tenure | 15% | 3–15 years licensed = full points; under 2 or over 25 = half. |

Rules:

- Rows with `unverified` volume get a score but are flagged `needs_review = yes`.
- Tier: A = 75+, B = 55–74, C = below 55.
