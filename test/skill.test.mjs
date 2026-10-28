import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const skill = readFileSync(new URL('../skills/fastaf-web-data/SKILL.md', import.meta.url), 'utf8');
test('skill version, exact live catalog and payment safety', () => {
  assert.match(skill, /version: "0.2.0"/);
  const names = [...skill.matchAll(/^\| `([^\`]+)` \|/gm)].map(m => m[1]).slice(0,22);
  assert.deepEqual(names, ["scrape_url", "google_search", "google_maps_places", "amazon_product", "search_news", "google_shopping_prices", "search_scholar", "search_jobs", "google_ai_answer", "search_walmart", "search_ebay", "search_zillow", "x_profile", "search_youtube", "youtube_transcript", "search_linkedin_jobs", "search_patents", "search_flights", "bing_search", "google_images", "read_reddit", "get_linkedin_profile"]);
  assert.match(skill, /Never create a fresh payment proof/);
  assert.doesNotMatch(skill, /retry with a fresh payment|scrape_page|search_amazon/);
});
