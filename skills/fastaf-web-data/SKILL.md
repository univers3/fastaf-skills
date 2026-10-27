---
name: fastaf-web-data
description: Fetch live web data with FastAF - scrape any public URL to markdown, get Google SERP results, and look up Amazon product prices by ASIN or keyword. Use when an agent needs current web pages, search rankings or Amazon prices, paying per call via x402 (no account) or with a FastAF API key / MCP server.
license: MIT
metadata:
  homepage: https://fastaf.co
---

# FastAF web data (scraping, SERP, Amazon)

FastAF is a web data API for agents. Docs: https://fastaf.co. Spec: https://api.fastaf.co/openapi.json

## Choose the access mode
1. **MCP** (if configured): server `https://api.fastaf.co/mcp`, header `Authorization: Bearer $FASTAF_API_KEY`. Tools: `scrape_page`, `search_web`, `search_amazon` (16 tools total).
2. **x402 pay-per-call** (no account): `GET https://api.fastaf.co/x402/v1/<endpoint>?...`. The first reply is 402 with a `PAYMENT-REQUIRED` header. Sign it with an x402 v2 client (e.g. `@x402/fetch`) and retry the identical URL with `PAYMENT-SIGNATURE`. Use a new signature on every call. Payment is charged only on success.
3. **API key**: free key at https://fastaf.co/signup/ (2 free calls after email verification).

## Web scraping
`GET /x402/v1/scrape?url=<URL>&formats=markdown` ($0.005)
- JS-heavy page: add `dynamic=true` and optionally `wait=3000` (0-35000 ms).
- Blocked page: `premium=true`, or `challenge_mode=true` (not combinable with dynamic/premium/country).
- Structured fields: `ai_query=Return the price and currency`. Rendering plus premium, or AI extraction, needs an API key (400 `options_need_api_key`).
- Do not use it for Amazon, eBay or Zillow: use their endpoints.

## Google SERP
`GET /x402/v1/serp?query=<q>&country=us&language=en` ($0.003). Read `organic_results[].{position,title,link,snippet}`. Paginate with `page`.

## Amazon
`GET /x402/v1/amazon?...` ($0.003)
- Product by ASIN: `asin=B0...&domain=com`
- Keyword search: `query=...`
- Other options: `resource` (offers, bestsellers…) and `country`/`postal_code` for localized prices.
- Current data only: store snapshots yourself if you need price history.

## Errors (nothing charged)
- 400: bad parameters
- 404: target_not_found
- 422: target unavailable
- 502: upstream failed
- 504: timeout
- 429 or 503: wait `Retry-After`, then retry with a fresh payment.

## Rules
- Only public pages. Never send credentials or cookies; they are not forwarded anyway.
- Prefer `formats=markdown` to save tokens.
