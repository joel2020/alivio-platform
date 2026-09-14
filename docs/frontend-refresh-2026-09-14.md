# Alivio public frontend refresh

User selected a polished recruiting firm direction. Build on the unpublished September 10 redesign while retaining the historical résumé import work. Scope is the public website, employer and candidate journeys, navigation, services, industries, and contact pages.

Palette: navy #0A2C4C, sea glass #A5D1C7, white #FFFFFF, cloud #F6F8FA, slate #526273. Self-hosted Inter carries navigation and body copy; restrained Georgia italic gives the homepage headline a personal character. The signature is the pairing of a direct recruiting promise with the conversation photograph and its sea-glass caption. Industry navigation follows the hero. No invented client logos, testimonials, or hiring results.

The earlier design had long, generic sales headings and repeated rounded image corners. This revision shortens the copy, establishes a navy first screen, and keeps the supporting layout quieter. Mobile navigation retains focus trapping and Escape. Existing inquiry and application behavior is preserved.

Validate responsive layouts, navigation, metadata, forms with intercepted writes, accessibility, build, and type checks. Deliver a hosted preview for visual review.

## Validation and delivery

September 14 verification: production build, TypeScript, targeted ESLint, and whitespace checks passed. Playwright against the built site passed 105 tests; 9 deployment-specific checks were skipped locally. The initial development-server run was replaced with this built-site run so that JavaScript-disabled prerender checks exercised the correct artifact. Browser writes were intercepted; no candidates or client inquiries were submitted during testing.

Desktop and mobile layouts were visually reviewed, and the hosted preview rendered successfully. Preview deployment: https://alivio-platform-agwhyk1j3-joel-carias-projects.vercel.app (Vercel deployment dpl_Fuc6rbx6X9wxyw2yMiMTRzpCna1k). Production was not promoted during this phase.
