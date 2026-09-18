# Realtor Prospecting Pipeline

This project finds active real estate agents in my target market, collects their
recent sales, ranks them, and produces a prospecting list.

## Target market (edit me)

- Area: Ashburn / Loudoun County, Virginia
- Zip codes: 20147, 20148, 20165, 20166, 20152
- Lookback window: last 12 months of closed sales

## Pipeline

When I say "run the pipeline" (or similar), do these steps in order:

1. Delegate to **lead-finder**. Pass it the zip codes above. It writes `output/agents_raw.csv`.
2. Delegate to **sales-researcher**. Pass it the path `output/agents_raw.csv`. It writes `output/agents_sales.csv`.
   - If any files exist in `data/mls-exports/`, tell it to use those as the primary source.
3. Delegate to **lead-ranker**. Pass it `output/agents_sales.csv` and `scoring.md`. It writes `output/ranked_leads.csv`.
4. Show me the top 15 rows and a one-paragraph summary of what stands out.

Subagents do not see this conversation. Always pass file paths, zip codes, and dates in the delegation prompt.

## Rules for every step

- Never invent names, emails, phone numbers, or sales figures. Mark missing data as `unverified`.
- Every sales figure needs a source (MLS export filename or a URL).
- Do not scrape sites whose terms prohibit automated collection (e.g., Zillow, Realtor.com). Use them only for manual spot-check links.
