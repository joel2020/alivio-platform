# Alivio backend template (CommonJS)

## PowerShell commands (Windows)

```powershell
# 1) Create folder and enter it
mkdir C:\alivio-backend
cd C:\alivio-backend

# 2) Initialize project and install packages
npm init -y
npm install express google-auth-library openai dotenv

# 3) Copy in files: package.json, .env.example, .gitignore, server.js
# 4) Create .env from the example
Copy-Item .env.example .env

# 5) Ensure your service-account.json exists at this exact path:
# C:\alivio-backend\service-account.json

# 6) Start server
npm run dev
```

### Quick tests

```powershell
# Health
Invoke-RestMethod -Method GET -Uri http://localhost:8080/health

# Retrieval-only
$body = @{ query = 'Find Directors of Nursing in New Jersey with SNF experience and multi-site leadership'; pageSize = 10 } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:8080/api/vertex-search -ContentType 'application/json' -Body $body

# Retrieval + generation
Invoke-RestMethod -Method POST -Uri http://localhost:8080/api/recruiter-search -ContentType 'application/json' -Body $body
```

## Sample frontend fetch (for aliviosearchpartners.com)

```js
async function runRecruiterSearch(query) {
  const response = await fetch('https://YOUR_BACKEND_DOMAIN/api/recruiter-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, pageSize: 10 })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }

  return response.json();
}

runRecruiterSearch('Find Directors of Nursing in New Jersey with SNF experience and multi-site leadership')
  .then((data) => console.log('Recruiter result:', data))
  .catch((err) => console.error(err));
```
