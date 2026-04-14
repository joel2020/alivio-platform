# Vertex AI Search Manual Seeding

This guide explains how to manually seed structured candidate/job records into the Alivio Vertex AI Search data store.

## When to Use Manual Seeding vs Website Crawl

Use **manual seeding** when you need:
- Immediate, predictable test data for QA or demos.
- Structured records (candidate/job metadata) that are not yet available on crawled pages.
- Controlled validation for ranking/retrieval quality across known healthcare recruiting roles.

Use the **website crawl** when you need:
- Broad ingestion of public content from `aliviosearchpartners.com` and `aliviosearch.com`.
- Automated refresh of marketing/site pages over time.
- Unstructured content discovery at scale.

## Seed Script Details

The seeding script imports fixtures into this Discovery Engine data store:
- Project number: `807488403515`
- Data store ID: `alivio-candidates_1776188933051`
- Branch: `default_branch`

Fixtures are loaded from:
- `examples/seed-documents.json`

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```
2. Authenticate with a service account that has Discovery Engine write access.
3. Set credentials path:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
   ```

## Run Manual Seeding

From `backend/alivio-backend`:

```bash
npm run seed:vertex
```

The script prints per-document import status and exits non-zero if any document fails.

## Verify Data in Google Cloud Console

1. Open **Google Cloud Console** and confirm project `alivio-475419` is selected.
2. Navigate to **Vertex AI Search and Conversation**.
3. Open app `alivio-search_1776189054215` or directly open data store `alivio-candidates_1776188933051`.
4. Go to the **Data** / **Documents** view.
5. Confirm seeded IDs (for example `candidate-icu-rn-001`) appear and are searchable.

## Clear or Reset the Data Store

If seeded data needs to be removed/reset:

1. In the same data store view, use document management controls to delete specific documents by ID.
2. For bulk reset, use the Discovery Engine Documents API delete/purge options for the branch.
3. Re-run seeding with:
   ```bash
   npm run seed:vertex
   ```

> Tip: Prefer deleting only seed fixture IDs first so crawled website content remains intact.
