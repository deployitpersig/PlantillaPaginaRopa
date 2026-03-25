import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    // Clear any corrupted Supabase tokens before reloading
    if (typeof localStorage !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          background: '#fafafa'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#fee2e2', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 24, fontSize: 28
          }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#111' }}>
            Algo salió mal
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 400, marginBottom: 24, lineHeight: 1.6 }}>
            Ocurrió un error inesperado. Esto puede suceder por una conexión lenta a la base de datos. 
            Hacé click abajo para recargar.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#111', color: '#fff',
              border: 'none', borderRadius: 9999,
              padding: '12px 32px', fontSize: 14,
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
