import { Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

class PageErrorBoundary extends Component<{ children: ReactNode; pathname: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidUpdate(previous: Readonly<{ pathname: string }>) {
    if (this.state.failed && previous.pathname !== this.props.pathname) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main style={{ background: '#fff', color: '#102344', minHeight: '100vh', padding: '120px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }} role="alert">
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>We couldn’t load this page.</h1>
          <p style={{ color: '#526173', marginBottom: 24 }}>Check your connection and reload the page. If the problem continues, contact hello@aliviosearchpartners.com.</p>
          <button className="mkt-btn-primary" onClick={() => window.location.reload()}>Reload page</button>
          <a href="/" style={{ display: 'inline-block', margin: 16, color: '#1D55C6' }}>Return to homepage</a>
        </div>
      </main>
    );
  }
}

export default function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <PageErrorBoundary pathname={pathname}>{children}</PageErrorBoundary>;
}
