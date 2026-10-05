'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  status: string;
  createdAt: string;
  order: {
    id: string;
    customerName?: string;
    tableNumber?: string;
    status: string;
  };
  menuItem: {
    id: string;
    name: string;
    estimatedTime: number;
  };
}

interface KitchenStation {
  id: string;
  name: string;
}

export default function KitchenPage() {
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [stationOrders, setStationOrders] = useState<Record<string, OrderItem[]>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
    // Update current time every second for elapsed time calculation
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stations.length > 0) {
      fetchAllStationOrders();
    }
  }, [stations]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (stations.length > 0) {
        fetchAllStationOrders();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [stations]);

  const fetchStations = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/stations');
      if (!response.ok) throw new Error('Failed to fetch stations');
      const data = await response.json();
      setStations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load kitchen stations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStationOrders = async () => {
    try {
      const results: Record<string, OrderItem[]> = {};
      for (const station of stations) {
        const response = await fetch(`http://localhost:4000/api/stations/${station.id}/orders`);
        if (response.ok) {
          const data = await response.json();
          results[station.id] = data;
        }
      }
      setStationOrders(results);
    } catch (err) {
      console.error('Failed to fetch station orders:', err);
    }
  };

  const handleUpdateItemStatus = async (orderId: string, itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      // Refresh station orders
      await fetchAllStationOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update item status');
    }
  };

  const calculateElapsedTime = (createdAt: string): string => {
    const created = new Date(createdAt);
    const diffMs = currentTime.getTime() - created.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes % 60}m`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds % 60}s`;
    } else {
      return `${diffSeconds}s`;
    }
  };

  const isItemDelayed = (item: OrderItem): boolean => {
    const created = new Date(item.createdAt);
    const estimatedCompletion = new Date(created);
    estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + item.menuItem.estimatedTime);
    return currentTime > estimatedCompletion;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'QUEUED': return '#fff3e0';
      case 'PREPARING': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'QUEUED': return 'PREPARING';
      case 'PREPARING': return 'READY';
      default: return null;
    }
  };

  if (loading) {
    return <div>Loading kitchen view...</div>;
  }

  if (error) {
    return <div style={{ color: '#f44336' }}>{error}</div>;
  }

  const totalActiveItems = Object.values(stationOrders).reduce((sum, items) => sum + items.length, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Kitchen View</h1>
        <p style={{ color: '#666' }}>
          {totalActiveItems} active item{totalActiveItems !== 1 ? 's' : ''} across {stations.length} station{stations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {stations.map(station => {
          const items = stationOrders[station.id] || [];
          const delayedCount = items.filter(item => isItemDelayed(item)).length;

          return (
            <div key={station.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderBottom: '2px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{station.name}</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
                    {items.length} active item{items.length !== 1 ? 's' : ''}
                    {delayedCount > 0 && (
                      <span style={{ color: '#f44336', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                        ({delayedCount} delayed)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div style={{ padding: '1rem', minHeight: '200px' }}>
                {items.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#999', padding: '2rem 0' }}>
                    No active orders
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.map(item => {
                      const delayed = isItemDelayed(item);
                      const elapsed = calculateElapsedTime(item.createdAt);
                      const nextStatus = getNextStatus(item.status);

                      return (
                        <div
                          key={item.id}
                          className={delayed ? 'delayed' : ''}
                          style={{
                            border: delayed ? '2px solid #f44336' : '1px solid #e0e0e0',
                            borderRadius: '6px',
                            padding: '0.75rem',
                            backgroundColor: delayed ? '#ffebee' : getStatusColor(item.status),
                            position: 'relative'
                          }}
                        >
                          {delayed && (
                            <div style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '8px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              DELAYED
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ margin: 0, fontSize: '1rem', marginBottom: '0.25rem' }}>
                                {item.menuItem.name}
                              </h3>
                              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                <span style={{ fontWeight: 500 }}>Qty: {item.quantity}</span>
                                {item.order.customerName && (
                                  <span style={{ marginLeft: '0.75rem' }}>
                                    • {item.order.customerName}
                                  </span>
                                )}
                                {item.order.tableNumber && (
                                  <span style={{ marginLeft: '0.75rem' }}>
                                    • Table {item.order.tableNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`status-badge status-${item.status}`} style={{ fontSize: '0.75rem' }}>
                              {item.status}
                            </span>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '0.5rem',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ fontSize: '0.875rem' }}>
                              <span style={{ color: '#666' }}>Elapsed: </span>
                              <span style={{
                                fontWeight: 'bold',
                                color: delayed ? '#f44336' : '#333'
                              }}>
                                {elapsed}
                              </span>
                              <span style={{ color: '#999', marginLeft: '0.5rem' }}>
                                / Est: {item.menuItem.estimatedTime}m
                              </span>
                            </div>

                            {nextStatus && (
                              <button
                                onClick={() => handleUpdateItemStatus(item.order.id, item.id, nextStatus)}
                                className="primary"
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  fontSize: '0.875rem'
                                }}
                              >
                                → {nextStatus}
                              </button>
                            )}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                            Order #{item.order.id.slice(-6)} • {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
