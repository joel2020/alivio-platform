# n8n Integration Guide for Alivio Search Partners

This guide explains how to connect n8n workflows to Alivio so automations can trigger recruiter searches through:

- `POST /api/webhook/n8n`
- Base URL: `https://api.aliviosearchpartners.com`

---

## 1) Configure an n8n HTTP Request node

### Node settings

- **Method:** `POST`
- **URL:** `https://api.aliviosearchpartners.com/api/webhook/n8n`
- **Send Body:** JSON
- **JSON/RAW Parameters:** JSON
- **Body Content Type:** `application/json`

### Recommended headers

- `Content-Type: application/json`
- `x-webhook-secret: {{ $credentials.alivioWebhook.secret }}` (if your backend has `WEBHOOK_SECRET` set)

### Minimal request body

```json
{
  "query": "Find Directors of Nursing in New Jersey with SNF experience",
  "workflow_type": "candidate_search",
  "pageSize": 10,
  "metadata": {
    "source": "n8n",
    "workflow": "job-created-search"
  }
}
```

---

## 2) Set `x-webhook-secret` in n8n credentials

Use one of these approaches:

1. **Header Auth credential (recommended):**
   - Create a credential in n8n for Header Auth.
   - Header Name: `x-webhook-secret`
   - Header Value: your `WEBHOOK_SECRET` value from backend env vars.
   - Attach credential to your HTTP Request node.

2. **Per-node static header:**
   - In the HTTP Request node, add a header named `x-webhook-secret`.
   - Set value directly or reference an n8n variable/expression.

If `WEBHOOK_SECRET` is not configured in Alivio, this header is optional.

---

## 3) Sample request bodies by `workflow_type`

The endpoint supports these values:

- `candidate_search`
- `job_search`
- `match`
- `copilot`

> `query` is required for all workflow types.

### candidate_search

```json
{
  "query": "Find 20 ICU travel nurses in Texas with charge experience",
  "workflow_type": "candidate_search",
  "pageSize": 20,
  "metadata": {
    "tenant": "acme-health",
    "job_id": "job_1029"
  }
}
```

### job_search

```json
{
  "query": "Find open ICU RN roles in New York offering relocation",
  "workflow_type": "job_search",
  "pageSize": 10,
  "metadata": {
    "tenant": "acme-health",
    "requested_by": "scheduler-bot"
  }
}
```

### match

```json
{
  "query": "Match this ICU RN profile to high-priority East Coast roles",
  "workflow_type": "match",
  "pageSize": 15,
  "metadata": {
    "candidate_id": "cand_4488",
    "priority": "high"
  }
}
```

### copilot

```json
{
  "query": "Who are the best SNF leaders in New Jersey for a regional DON opening?",
  "workflow_type": "copilot",
  "pageSize": 8,
  "metadata": {
    "session_id": "copilot_session_77"
  }
}
```

---

## 4) Example workflow: New job added → trigger search → log top 5 matches to Google Sheets

### Flow

1. **Trigger:** New job event (Webhook, DB trigger, or app event).
2. **Set node:** Build `query` text from job fields.
3. **HTTP Request:** Call `POST /api/webhook/n8n` with `workflow_type = "candidate_search"`.
4. **Code or Item Lists node:** Keep only first 5 `ranked_matches`.
5. **Google Sheets node:** Append rows with candidate name, score, and rationale.

### Suggested HTTP body expression

```json
{
  "query": "={{ `Find top candidates for ${$json.title} in ${$json.location} with ${$json.required_skills}` }}",
  "workflow_type": "candidate_search",
  "pageSize": 10,
  "metadata": {
    "workflow": "job-created-to-sheets",
    "job_id": "={{ $json.job_id }}"
  }
}
```

---

## 5) Example workflow: Daily digest → run 3 recruiter queries → send email summary

### Flow

1. **Cron node:** Run daily (e.g., 7:00 AM local time).
2. **Set node:** Build an array of 3 queries.
3. **Split In Batches:** Iterate each query.
4. **HTTP Request:** Call `POST /api/webhook/n8n` with `workflow_type = "copilot"`.
5. **Merge/Aggregate:** Collect response summaries.
6. **Email node (SMTP/Gmail):** Send combined digest.

### Example query list

- “Top oncology nurse leaders in California this week”
- “Urgent ICU placements in Midwest requiring night shifts”
- “SNF administrators with multi-site turnaround experience”

---

## 6) Parse `ranked_matches` in n8n Set node

`POST /api/webhook/n8n` returns the same shape as `/api/recruiter-search`, where ranked results are in:

- `generated.ranked_matches`

### In a Set node, map the first result

- **candidate_name:** `={{ $json.generated.ranked_matches[0].name }}`
- **score:** `={{ $json.generated.ranked_matches[0].score }}`
- **reason:** `={{ $json.generated.ranked_matches[0].reason }}`

### Flatten top 5 results (Code node example)

```javascript
const matches = $json.generated?.ranked_matches || [];
return matches.slice(0, 5).map((m, idx) => ({
  rank: idx + 1,
  name: m.name || m.candidate_name || 'Unknown',
  score: m.score ?? null,
  reason: m.reason || m.explanation || ''
}));
```

This flattened output is convenient for Sheets rows, Slack blocks, or email tables.

---

## 7) Response and error notes

- Success response shape matches `/api/recruiter-search` exactly.
- Validation failures return 400 (e.g., missing `query`, invalid `workflow_type`).
- Invalid/missing `x-webhook-secret` returns 401 when `WEBHOOK_SECRET` is enabled.
- Keep `pageSize` between 1 and 20 (out-of-range values are clamped server-side).
