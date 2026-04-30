import {
  HOMEPAGE_SMOKE_MARKER,
  SITE_APP_NAME,
  SITE_BUILD_MARKER,
  SITE_CTA_URL,
} from '../../lib/siteVersion';

export default function SiteVersionPage() {
  return (
    <main style={{ padding: '96px 24px 64px', background: 'var(--bg-base)', minHeight: '60vh' }}>
      <div className="mkt-container" style={{ maxWidth: '720px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 24px' }}>
          Site Version
        </h1>
        <dl style={{ display: 'grid', gap: '14px', margin: 0 }}>
          <div>
            <dt style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>App</dt>
            <dd style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{SITE_APP_NAME}</dd>
          </div>
          <div>
            <dt style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Homepage marker</dt>
            <dd style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{HOMEPAGE_SMOKE_MARKER}</dd>
          </div>
          <div>
            <dt style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current build marker</dt>
            <dd style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{SITE_BUILD_MARKER}</dd>
          </div>
          <div>
            <dt style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CTA URL</dt>
            <dd style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>
              <a href={SITE_CTA_URL} style={{ color: 'var(--accent)', fontWeight: 600 }}>{SITE_CTA_URL}</a>
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}

