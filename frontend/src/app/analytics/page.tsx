'use client';

import { useState, useEffect } from 'react';

interface PopularItem {
  name: string;
  count: number;
}

interface LowStockIngredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

interface AnalyticsData {
  activeOrders: number;
  readyOrders: number;
  servedOrders: number;
  cancelledOrders: number;
  delayedOrders: number;
  avgPrepTime: number;
  monthlyRevenue: number;
  popularItems: PopularItem[];
  lowStockIngredients: LowStockIngredient[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{ color: '#f44336' }}>{error}</div>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  const totalOrders = analytics.activeOrders + analytics.readyOrders + analytics.servedOrders + analytics.cancelledOrders;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Dashboard & Analytics</h1>
        <p style={{ color: '#666' }}>Real-time insights from your restaurant operations</p>
      </div>

      {/* Order Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666', fontWeight: 500 }}>Active Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#1976d2' }}>
            {analytics.activeOrders}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            In progress (Created, Queued, Preparing)
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666', fontWeight: 500 }}>Ready Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#7b1fa2' }}>
            {analytics.readyOrders}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            Awaiting service
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666', fontWeight: 500 }}>Served Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#00796b' }}>
            {analytics.servedOrders}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            Completed
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666', fontWeight: 500 }}>Cancelled Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#c62828' }}>
            {analytics.cancelledOrders}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {totalOrders > 0 ? `${((analytics.cancelledOrders / totalOrders) * 100).toFixed(1)}% cancellation rate` : 'No orders yet'}
          </p>
        </div>

        <div className="card" style={{ borderColor: analytics.delayedOrders > 0 ? '#f44336' : '#e0e0e0' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666', fontWeight: 500 }}>Delayed Orders</h3>
          <p style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0,
            color: analytics.delayedOrders > 0 ? '#f44336' : '#333'
          }}>
            {analytics.delayedOrders}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {analytics.delayedOrders > 0 ? '⚠ Needs attention' : 'On track'}
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666', fontWeight: 500 }}>Avg Prep Time</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#388e3c' }}>
            {analytics.avgPrepTime} min
          </p>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            For completed orders
          </p>
        </div>
      </div>

      {/* Revenue */}
      <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#e8f5e9', borderColor: '#4caf50' }}>
        <h2 style={{ marginBottom: '0.5rem', color: '#2e7d32' }}>Monthly Revenue</h2>
        <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: '1rem 0', color: '#1b5e20' }}>
          ${analytics.monthlyRevenue.toFixed(2)}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
          From {analytics.servedOrders} served order{analytics.servedOrders !== 1 ? 's' : ''} this month
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Popular Menu Items */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Popular Menu Items</h2>
          {analytics.popularItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>
              No sales data yet. Complete some orders to see popular items.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics.popularItems.map((item, index) => {
                const maxCount = analytics.popularItems[0]?.count || 1;
                const percentage = (item.count / maxCount) * 100;

                return (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ color: '#666', fontSize: '0.875rem' }}>
                        {item.count} sold
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#0070f3',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Ingredients */}
        <div className="card" style={{ borderColor: analytics.lowStockIngredients.length > 0 ? '#f44336' : '#e0e0e0' }}>
          <h2 style={{ marginBottom: '1rem' }}>
            Low Stock Ingredients
            {analytics.lowStockIngredients.length > 0 && (
              <span style={{
                marginLeft: '0.5rem',
                backgroundColor: '#f44336',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                {analytics.lowStockIngredients.length}
              </span>
            )}
          </h2>
          {analytics.lowStockIngredients.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0' }}>
              ✓ All ingredients are well-stocked
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics.lowStockIngredients.map(ingredient => {
                const stockPercentage = Math.min((ingredient.currentStock / ingredient.minStock) * 100, 100);

                return (
                  <div key={ingredient.id} style={{ padding: '0.75rem', backgroundColor: '#ffebee', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#c62828' }}>{ingredient.name}</span>
                      <span style={{ fontSize: '0.875rem', color: '#666' }}>
                        {ingredient.currentStock} / {ingredient.minStock} {ingredient.unit}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#ffcdd2',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          width: `${stockPercentage}%`,
                          height: '100%',
                          backgroundColor: '#f44336',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
