# Alivio candidate applications, ATS/CRM, and messaging

Status: approved by user; implementation and verification underway. No production changes or candidate messages have been made. Website design options 1 and 3 remain available; the visual selection is a separate pending decision.

## Intended outcome

A candidate applies to a published role, uploads a résumé, answers a short questionnaire, and receives an acknowledgment. Alivio can review that application in its recruiting platform, manage the candidate through a hiring pipeline, keep notes and communication history, and send configured follow-ups. Extend the existing platform rather than create a disconnected ATS.

The first delivery is one complete application-to-recruiter workflow with email. SMS or WhatsApp is an optional channel decision pending the user's response; it is not needed to complete the email workflow.

## Verified current state

- React/Vite marketing pages already display jobs and accept applications through `supabase/functions/public-intake/index.ts`.
- The public application form accepts résumé/LinkedIn links, not a résumé file. It has no structured screening questionnaire.
- The intake handler inserts into `applications` and attempts an internal Resend notification. It does not send candidate acknowledgments and does not check the provider response status for the internal notification.
- Live schema inspection confirms `applications` references numeric `jobs` IDs. The internal recruiting `candidates` table requires an organization ID and a UUID `roles` ID. `jobs` currently has neither mapping. Intake cannot safely guess a role or organization from a title.
- Existing candidate profiles, role pipelines, CRM pages, résumé upload components, and outreach tables can be reused.
- The outreach confirmation handler saves the first message as sent and sets its send timestamp without calling an email provider in that handler. Delivery status must be corrected as part of the messaging work.
- The existing résumé bucket is private, but its checked-in policies broadly allow authenticated users. Public application uploads must use a narrowly authorized storage path, not expose that bucket to anonymous users.
- Resend is already referenced in the code and was the messaging result returned by live Vercel Marketplace discovery. Sender configuration and delivery still need verification; no new provider account or subscription is necessary merely to begin designing this integration.

## Candidate experience

1. Select a published job from Careers.
2. Enter name, email, optional phone, and optional LinkedIn profile.
3. Upload a PDF or DOCX résumé, maximum 5 MB. Display the chosen filename, validation errors, and upload progress. Do not require an account to apply.
4. Complete a short questionnaire, designed for roughly 2–3 minutes:
   - Current city/country and preferred work arrangement.
   - Experience relevant to this position (short answer).
   - Relevant skills or professional licenses/certifications (job-specific wording).
   - Earliest available start date or notice period.
   - A brief explanation of interest in the role.
5. Review the application and acknowledge the applicant privacy notice. Any optional future-opportunity subscription is separate and unchecked by default.
6. Submit once. See an application reference and confirmation on screen after durable storage succeeds.
7. Receive a branded email acknowledgment with the role title and reference. An email failure does not erase or fail an already saved application.

Answers are stored with the question text/version used at submission. They support human review; no automatic rejection or hiring decisions based on questionnaire answers are introduced.

## Recruiter ATS and CRM

Use the existing authenticated Alivio workspace, with an Applications inbox and links to the existing candidate and role pages. The client/company CRM remains the system for client relationships; candidates and applications appear in their recruiting context rather than being inserted as client contacts.

Application stages: New → Reviewing → Screening → Interview → Offer → Hired, with separate Rejected and Withdrawn outcomes. Map these deliberately to existing pipeline values during implementation instead of silently replacing existing stages.

Recruiters can filter by job, stage, date, and assigned recruiter; open the résumé and questionnaire together; record notes and next-action tasks; assign ownership; link the application to its candidate record; and review a timestamped communication history. All changes must respect organization and recruiter/admin permissions.

Introduce an explicit server-controlled mapping from each public job to its internal role and organization. Unmapped legacy jobs stay visible but new applications enter a restricted admin triage inbox until mapped. Never drop applications or infer an organization from user input. Existing candidates are matched within the mapped role/organization using normalized email, while separate applications remain preserved. Shared candidate identity across multiple roles requires a later deliberate schema change, not an unsafe global merge.

## Automated communications

Immediate confirmation after successful submission; internal recruiter notification; recruiter-triggered screening/interview invitations; configurable follow-up and status templates. Use the existing Resend integration after verifying its authenticated sender. Production activation is scoped to this new application flow, without retroactively sending messages to historical candidates.

Suggested acknowledgment:

> Subject: Application received — {{role_title}}
>
> Hi {{first_name}},
>
> Thank you for applying for the {{role_title}} opportunity through Alivio Search Partners. We received your résumé and application. Your reference is {{application_reference}}.
>
> Our recruiting team will review your experience against the role requirements. If there is a potential fit, we will contact you about next steps.
>
> Thank you,
> Alivio Search Partners

Avoid promises of interview timing or a guaranteed response deadline. Interview and rejection messages are triggered by explicit recruiter actions or enabled rules, not inferred by AI. Scheduled follow-ups stop on reply, opt-out, withdrawal, or a terminal application stage. If inbound reply detection is not configured, unattended follow-up sequences remain disabled; acknowledgments still work.

Messages have visible queued, sending, accepted by provider, delivered where confirmed, and failed states. Only provider-confirmed acceptance sets `sent_at`; delivery requires corresponding provider evidence. Persist the message event/outbox with the application transaction, use a unique application/event key, lease queued work, retry transient failures, and record terminal failures for recruiter action. Never blindly retry an uncertain send beyond the provider's documented idempotency window.

## Data and upload boundaries

Additive schema changes preserve current applications, candidates, and URLs. Store application ownership/mapping, résumé object reference, questionnaire version/answers, consent timestamp/version, candidate linkage, and message events. Use private upload objects with server-generated paths and short-lived authorized upload/download access. Validate file size, extension and content type/signature server-side; prevent executable formats and do not trust the client filename. Clean abandoned uploads after a bounded interval. Serve downloads only to authorized reviewers; no public résumé URLs.

Anonymous traffic cannot read or modify application records directly. Public endpoints validate job availability, required fields, lengths, bounded request bodies, and uploaded object ownership. Rate limiting must work across instances. Questionnaire text and candidate data are untrusted, never instructions to an AI or unsanitized email/HTML. Server-only credentials remain outside the browser. Logs record event IDs and safe error categories rather than résumé contents or full application payloads.

## Acceptance criteria

- A synthetic application can upload a valid résumé, answer all questions, save once, and appear under the correct authorized recruiting context.
- Double-clicks and network retries do not create duplicate applications or acknowledgments for the same submission key.
- Invalid files, missing answers, closed/unknown jobs, forged storage references, and oversized requests are rejected without creating a complete application.
- Anonymous users and unrelated organizations cannot access applicant data or résumé downloads.
- Provider failure leaves the application intact and a visible retry/failure record; the UI never falsely claims a message was sent.
- Historical candidates do not receive messages when the feature is deployed.
- Existing lead intake, job pages, CRM, and authenticated recruiting flows remain functional.
- Build, typecheck, lint, relevant backend tests, database policy checks, and browser application-flow tests pass.
- Use synthetic test candidates and provider test facilities/suppressed recipients. Live candidate sending is not a verification method.

## Delivery sequence

1. Confirm this workflow and messaging channel; verify the existing sender and deployment configuration.
2. Implement additive ownership/job mapping, secure upload intake, questionnaire, transactional application/message persistence, and acknowledgments.
3. Connect the recruiter application inbox, candidate profiles, stage changes, notes/tasks, and message history.
4. Complete tested follow-up processing and its stop conditions, correct existing false sent states for new actions, and validate on a preview/staging path before activating the new flow.

This is the delivery design, not evidence that these capabilities are implemented or deployed.
