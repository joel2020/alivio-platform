# Alivio Recruiter Dashboard

This dashboard is a static HTML app (`alivio-dashboard.html`) that calls the Alivio API.

## Run locally against local backend

1. Start the backend API on `http://localhost:3000`.
2. In `frontend/alivio-dashboard-config.js`, keep the Dev line enabled:
   ```js
   window.ALIVIO_API_BASE = 'http://localhost:3000';
   ```
3. Serve the `frontend` directory with any static server, for example:
   ```bash
   cd frontend
   python3 -m http.server 8080
   ```
4. Open `http://localhost:8080/alivio-dashboard.html`.

## Run locally against Vercel backend

1. Update `frontend/alivio-dashboard-config.js` to the backend you want:
   - Staging:
     ```js
     window.ALIVIO_API_BASE = 'https://staging-api.aliviosearchpartners.com';
     ```
   - Production:
     ```js
     window.ALIVIO_API_BASE = 'https://api.aliviosearchpartners.com';
     ```
2. Serve the `frontend` directory locally:
   ```bash
   cd frontend
   python3 -m http.server 8080
   ```
3. Open `http://localhost:8080/alivio-dashboard.html`.

## Deploy dashboard to aliviosearchpartners.com

1. Set `frontend/alivio-dashboard-config.js` to the production API base:
   ```js
   window.ALIVIO_API_BASE = 'https://api.aliviosearchpartners.com';
   ```
2. Deploy the `frontend/alivio-dashboard.html`, `frontend/alivio-api-client.js`, and `frontend/alivio-dashboard-config.js` files to your hosting target for `aliviosearchpartners.com` (for example, Vercel static hosting, CDN bucket, or web server).
3. Verify the footer indicator in the dashboard shows the production API base and a green connection dot.
4. Smoke-test candidate and job workflows in the deployed environment.
