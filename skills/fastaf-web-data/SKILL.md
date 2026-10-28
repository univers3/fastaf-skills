---
name: fastaf-web-data
description: Fetch live public web data with FastAF via MCP, API key or x402. Use for web and image search, public Reddit feeds without authors, LinkedIn jobs, patents, flights, YouTube search/transcripts, scraping and product lookups.
license: MIT
metadata:
  homepage: https://fastaf.co
  version: "0.2.0"
---

# FastAF web data

Docs: https://fastaf.co/docs/ · REST schema: https://api.fastaf.co/openapi.json
Live catalog/prices: https://api.fastaf.co/.well-known/x402

## Access and payment safety

1. **MCP**: `https://api.fastaf.co/mcp`, OAuth discovery or
   `Authorization: Bearer $FASTAF_API_KEY`. Discover exact arguments with
   `tools/list`; 22 tools were verified on 2026-10-28.
2. **API key**: `/v1/<endpoint>` with the same Authorization header.
   Signup: https://fastaf.co/signup/; confirm email for 2 free calls per account.
   Keyed 402 means insufficient credits, not permission to spend a wallet.
3. **x402**, no account: `/x402/v1/<endpoint>`. The unsigned reply is 402;
   use the authoritative `PAYMENT-REQUIRED` challenge with a configured
   x402 v2 client and explicit spending limits. Submit the same URL/body with
   `PAYMENT-SIGNATURE`. Only successful results settle.

Do not wrap a paid call in a blind retry loop. A network timeout or gateway
5xx can follow settlement. Never create a fresh payment proof to recover an
ambiguous paid call; first inspect the receipt/transaction. The server does not
promise cached-result replay with the same proof, so do not replay settled
proofs either. A new, deliberately authorized call needs its own proof.

Server PR #136 retries selected upstream searches once (500 ms delay, one
105-second budget, one reservation/charge); this does not make repeated client
calls idempotent. SDK 0.2.0 is **proposed, not yet published**: its x402 adapter
retries only unsigned network/429/5xx failures and permits one signed
transmission; keyed retries require exact confirmed no-charge errors.
Honor Retry-After. No retry on success, empty results or parameter errors.
Use a timeout of at least 120 seconds for long searches when appropriate.

## MCP tools (exact live names)

| Tool | Purpose |
| --- | --- |
| `scrape_url` | Read URL |
| `google_search` | Google Search |
| `google_maps_places` | Google Maps Places |
| `amazon_product` | Amazon Product |
| `search_news` | Search News |
| `google_shopping_prices` | Google Shopping Prices |
| `search_scholar` | Search Scholar |
| `search_jobs` | Search Jobs |
| `google_ai_answer` | Google AI Answer |
| `search_walmart` | Search Walmart |
| `search_ebay` | Search eBay |
| `search_zillow` | Search Zillow |
| `x_profile` | X Profile |
| `search_youtube` | Search YouTube |
| `youtube_transcript` | YouTube Transcript |
| `search_linkedin_jobs` | LinkedIn public job listings |
| `search_patents` | Google Patents |
| `search_flights` | Google Flights |
| `bing_search` | Bing web search results |
| `google_images` | Google Images search results |
| `read_reddit` | Public Reddit feed |
| `get_linkedin_profile` | Get LinkedIn Profile |

The REST endpoint names and MCP tool names differ; never guess a tool name.
Full current schemas: `tools/list` or
https://api.fastaf.co/.well-known/mcp/server-card.json.

## New REST endpoints

Prefix these with `/v1` (key) or `/x402/v1` (payment).
Prices below are unsigned x402 quotes observed on 2026-10-28, not MCP credit
prices; always use the live challenge before paying.

| Endpoint | Required/example inputs | x402 USD |
| --- | --- | --- |
| `linkedin_jobs` | `field=Python developer`; optional `location=London` | 0.005 |
| `bing` | `query=coffee`; optional `mkt=en-US` | 0.005 |
| `images` | `query=coffee`; optional `licenses=f` | 0.010 |
| `reddit` | `url=https://www.reddit.com/r/python/` | 0.003 |
| `patents` | `query=battery`; optional `num=5` | 0.005 |
| `flights` | `departure_id=JFK&arrival_id=LHR&outbound_date=2026-12-01&type=2` | 0.005 |
| `youtube` | search: `query=coffee`; transcript: `video_id=dQw4w9WgXcQ` | 0.005 |

Use future dates for flights. Reddit reads public subreddit/thread RSS, which
may be partial, and removes author fields/user-profile links; it is not a
user-history endpoint. Discussion text itself may still contain names.
Verify image usage rights at the source; a license filter is not permission.

## Existing common REST operations

- Scrape: `/scrape?url=<encoded URL>&formats=markdown` (x402 from $0.005).
  JS-heavy pages: `dynamic=true`, optional `wait=3000` (0–35000 ms).
  Blocked pages: `premium=true` or `challenge_mode=true`; challenge mode is
  not combinable with dynamic/premium/country. Rendering plus premium or
  AI extraction requires API-key mode (`options_need_api_key`).
- Google: `/serp?query=<q>&country=us&language=en` ($0.003).
- Amazon: `/amazon?asin=<ASIN>&domain=com` or `query=<q>` ($0.003).
  Use dedicated Amazon/eBay/Zillow endpoints instead of generic scraping.

Only public pages. Do not send credentials or cookies for target sites.
Do not claim every error means no charge. 400 needs corrected parameters;
404/422 indicate missing/unavailable targets. After ambiguous failures,
stop and reconcile billing before authorizing another call.
