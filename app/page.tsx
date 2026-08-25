export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#f9f6f1',
      fontFamily: 'Georgia, serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: '#2c1a0e', fontSize: '22px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Scape West
        </h1>
        <p style={{ color: '#8b7355', fontSize: '14px', letterSpacing: '1px', marginBottom: '40px' }}>
          Furniture Care Automation
        </p>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          textAlign: 'left',
        }}>
          <p style={{ color: '#5c3d1e', fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px' }}>
            This service automatically sends a wax care reminder email to customers{' '}
            <strong>90 days</strong> after they purchase furniture from{' '}
            <a href="https://scape-west.co.uk" style={{ color: '#8b5e3c' }}>scape-west.co.uk</a>.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid #e8ddd0', margin: '24px 0' }} />

          <div style={{ fontSize: '14px', color: '#8b7355', lineHeight: '1.8' }}>
            <p style={{ margin: '0 0 8px' }}>
              Webhook:{' '}
              <code style={{ background: '#f0e8d8', padding: '2px 6px', borderRadius: '3px' }}>
                /api/webhook
              </code>
            </p>
            <p style={{ margin: '0' }}>Cron job: runs daily at 09:00 UTC</p>
          </div>
        </div>
      </div>
    </main>
  );
}
