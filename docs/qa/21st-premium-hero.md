# 21st.dev premium hero — September 8, 2026

Used the authenticated official 21st CLI to search the catalog and retrieve Editorial Collage Hero (id 19074, felipemenezes098). Renewed the existing CLI session through the normal browser authorization. The configured native MCP server did not expose tools in this session; the official CLI supplied the component. No credential is embedded in the site.

Adapted the two-column editorial/media composition with existing Alivio CTAs, an overlapping search-standards panel, preserved H1, and direct links to healthcare, technology and LATAM. Source/license attribution is in docs/licenses/21st-editorial-collage-hero.md. The artwork is an original generated decorative sculpture, not an actual office or team photo. JPEGs are local, responsive, explicitly sized and high-priority; no new runtime dependencies.

Build/prerender, types, focused lint and diff checks passed. Eleven focused browser checks passed: homepage widths, contrast, desktop section navigation, founder/evidence, and mobile menu keyboard behavior. Desktop 1440px and mobile 390px hero screenshots reviewed. The image decoded successfully and CSS animation was none under prefers-reduced-motion: reduce. Deployment validation is recorded on the release PR.

Claude was supplied the design plan and diff review request but remained blocked by its session usage limit. Direct review completed; no independent review is claimed. Rollback baseline: 66655679f0e868deff3bec08ca09c4da00b5a38f.
