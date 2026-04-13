# Alivio Search Partners Compliance Audit

**Audit date:** April 13, 2026  
**Scope:** Public marketing pages, legal pages, and visible application architecture references in the frontend repository.

## Executive Summary

This audit updates the Privacy Policy and Terms of Service to a venture-backed B2B SaaS baseline and identifies compliance controls that are already present versus controls that should be implemented or documented before representing "full compliance" externally.

## What was reviewed

- Marketing legal pages (`/privacy`, `/terms`)
- Footer legal attribution and public legal links
- Frontend references to auth, data handling, and third-party services (Supabase, email, OAuth)
- Public crawler directives (`robots.txt`, `sitemap.xml`)

## Findings by compliance domain

### 1) Privacy disclosures (GDPR/UK GDPR/US state privacy)

**Status:** Partially implemented; policy language has been materially upgraded.

- Added processor/controller role clarity for customer-submitted recruiting data.
- Added legal-basis language for GDPR/UK GDPR.
- Added international transfer mechanisms.
- Added state privacy rights framing for CCPA/CPRA-style requests.

**Remaining actions to claim operational compliance:**
- Publish a data-subprocessor list and update process.
- Publish a dedicated data subject request (DSR) workflow and SLA.
- Implement and document cookie consent controls if non-essential cookies are added.

### 2) Contractual terms and risk allocation

**Status:** Improved to startup SaaS standard in Terms.

- Added confidentiality, indemnity, liability cap, suspension/termination, and governing law clauses.
- Added AI-assisted output disclaimer and human-review responsibility.

**Remaining actions:**
- Attach a formal Order Form template, DPA template, and security exhibit.
- Add a separate enterprise MSA if selling to larger regulated buyers.

### 3) Security and access controls

**Status:** Architecture indicates role-based and authenticated app flows, but external proof artifacts are not present in this repository.

**Remaining actions:**
- Publish security whitepaper and incident response policy.
- Complete vendor risk review for infrastructure and subprocessors.
- Maintain vulnerability management and penetration testing cadence.

### 4) Recruiting and employment-law risk

**Status:** Terms require lawful use, but operational safeguards are not fully evidenced from frontend code alone.

**Remaining actions:**
- Document adverse-impact monitoring and anti-bias review controls for AI-assisted workflows.
- Add state-specific call-recording consent enforcement controls where voice features are used.
- Add customer-facing guidance for fair hiring and retention periods.

### 5) Public website governance

**Status:** Legal links and ownership notice are present and updated.

**Remaining actions:**
- Add dedicated legal contact inbox workflows (privacy@, legal@) with internal owner assignment.
- Add accessibility statement and WCAG testing cadence.
- Add explicit effective date versioning and change log for legal docs.

## Compliance readiness score (practical)

- **Policy posture:** Strong baseline after this update.
- **Operational evidence posture:** Moderate; requires supporting procedures and records.
- **Claim of "full compliance":** Not recommended until remaining actions are completed and documented.

## Required next-step checklist

1. Finalize and publish DPA + SCC modules for international customers.
2. Stand up DSR intake and verification process.
3. Implement cookie consent banner if any non-essential trackers are deployed.
4. Establish audit-ready security documentation set (IR plan, access review logs, vendor list).
5. Publish AI governance statement for recruiting outputs.

