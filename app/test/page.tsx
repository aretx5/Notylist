export default function TestPage() {
  return (
    <div style={{ padding: '2rem', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Test Page - No Auth Required</h1>
      <p>If you can see this, the app is deployed correctly.</p>
      <div style={{ marginTop: '2rem' }}>
        <h2>Environment Variables:</h2>
        <pre style={{ background: '#222', padding: '1rem', borderRadius: '8px' }}>
          NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
          {'\n'}NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'}
        </pre>
      </div>
    </div>
  );
}
