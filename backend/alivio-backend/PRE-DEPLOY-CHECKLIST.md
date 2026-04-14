# Pre-Deploy Checklist (Vercel)

- [ ] npm audit clean
- [ ] .gitignore covers all secret file patterns
- [ ] .env.example matches server.js env var usage
- [ ] vercel.json present and correct
- [ ] /health returns ok
- [ ] /api/status returns all keys configured
- [ ] GOOGLE_APPLICATION_CREDENTIALS_JSON set in Vercel dashboard
- [ ] LLM_API_KEY set in Vercel dashboard
- [ ] LLM_MODEL set in Vercel dashboard
- [ ] CORS_ORIGIN set if frontend on different domain
- [ ] Custom domain CNAME added in Vercel
- [ ] npm run smoke passes locally
- [ ] npm run validate:deployment passes against Vercel URL
