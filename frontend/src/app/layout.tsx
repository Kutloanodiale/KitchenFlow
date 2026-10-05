import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KitchenFlow - Restaurant Operations System',
  description: 'Restaurant kitchen operations and order management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0', marginBottom: '2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
            <a href="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
              KitchenFlow
            </a>
            <a href="/orders" style={{ textDecoration: 'none', color: '#666' }}>Orders</a>
            <a href="/kitchen" style={{ textDecoration: 'none', color: '#666' }}>Kitchen</a>
            <a href="/menu" style={{ textDecoration: 'none', color: '#666' }}>Menu</a>
            <a href="/inventory" style={{ textDecoration: 'none', color: '#666' }}>Inventory</a>
            <a href="/analytics" style={{ textDecoration: 'none', color: '#666' }}>Analytics</a>
          </div>
        </nav>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
