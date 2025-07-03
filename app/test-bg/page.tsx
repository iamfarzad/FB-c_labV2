export default function TestBg() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '2rem', marginBottom: '20px' }}>
        Test Background Page
      </h1>
      <p style={{ color: '#666', fontSize: '1.2rem' }}>
        This is a simple test page to check if routing works.
      </p>
      <div style={{
        width: '100%',
        height: '300px',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        marginTop: '20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Test Background Working!
      </div>
    </div>
  );
}
