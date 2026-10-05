export default function Home() {
  return (
    <div>
      <h1>KitchenFlow Dashboard</h1>
      <p>Welcome to the Restaurant Operations & Order Management System</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <div className="card">
          <h3>Active Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
        <div className="card">
          <h3>Ready Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
        </div>
        <div className="card">
          <h3>Delayed Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336' }}>0</p>
        </div>
        <div className="card">
          <h3>Low Stock Items</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>0</p>
        </div>
      </div>
    </div>
  );
}
