'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  id: string;
  quantity: number;
  status: string;
  menuItem: {
    id: string;
    name: string;
    price: number;
  };
  station: {
    id: string;
    name: string;
  };
}

interface OrderStatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: string;
}

interface Order {
  id: string;
  customerName?: string;
  tableNumber?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  available: boolean;
  estimatedTime: number;
  station: {
    name: string;
  };
}

type OrderStatus = 'CREATED' | 'QUEUED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

const STATUS_FLOW: OrderStatus[] = ['CREATED', 'QUEUED', 'PREPARING', 'READY', 'SERVED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create order form state
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderItems, setOrderItems] = useState<Array<{ menuItemId: string; quantity: number }>>([]);

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || undefined,
          tableNumber: tableNumber || undefined,
          items: orderItems,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const newOrder = await response.json();
      
      // Reset form and go back to list view
      setShowCreateForm(false);
      setCustomerName('');
      setTableNumber('');
      setOrderItems([]);
      setSelectedOrder(null); // Clear selected order to show the list
      
      // Refresh orders list
      await fetchOrders();
      
      // Show success message and clear it after 3 seconds
      setSuccessMessage(`Order #${newOrder.id.slice(-6)} created successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await fetch(`http://localhost:4000/api/orders/${orderId}`).then(r => r.json());
        setSelectedOrder(updated);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`http://localhost:4000/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel order');
      }

      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel order');
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
        throw new Error(error.error || 'Failed to update item status');
      }

      // Refresh the orders list
      await fetchOrders();

      // Also refresh the selected order detail view so changes appear immediately
      if (selectedOrder?.id === orderId) {
        const updatedRes = await fetch(`http://localhost:4000/api/orders/${orderId}`);
        if (updatedRes.ok) {
          const updated = await updatedRes.json();
          setSelectedOrder(updated);
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update item status');
    }
  };

  const addOrderItem = () => {
    if (menuItems.length === 0) return;
    setOrderItems([...orderItems, { menuItemId: menuItems[0].id, quantity: 1 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const filteredOrders = statusFilter === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus as OrderStatus);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIndex + 1];
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div style={{ color: '#f44336' }}>{error}</div>;
  }

  return (
    <div>
      {successMessage && (
        <div style={{
          background: '#e8f5e9',
          color: '#2e7d32',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #a5d6a7',
        }}>
          {successMessage}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Orders</h1>
        <button className="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Order'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Create New Order</h2>
          <form onSubmit={handleCreateOrder}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Table Number (Optional)
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table number"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 500 }}>Order Items</label>
                <button type="button" onClick={addOrderItem}>+ Add Item</button>
              </div>
              {orderItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select
                    value={item.menuItemId}
                    onChange={(e) => updateOrderItem(index, 'menuItemId', e.target.value)}
                    style={{ flex: 2 }}
                  >
                    {menuItems.map(mi => (
                      <option key={mi.id} value={mi.id}>
                        {mi.name} - ${mi.price.toFixed(2)} ({mi.station.name})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                    style={{ flex: 1 }}
                    placeholder="Qty"
                  />
                  <button type="button" onClick={() => removeOrderItem(index)}>Remove</button>
                </div>
              ))}
              {orderItems.length === 0 && (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No items added yet. Click "Add Item" to start.</p>
              )}
            </div>

            <button type="submit" className="primary" disabled={orderItems.length === 0 || submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'CREATED', 'QUEUED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              background: statusFilter === status ? '#0070f3' : '#fff',
              color: statusFilter === status ? '#fff' : '#333',
              borderColor: statusFilter === status ? '#0070f3' : '#ccc',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {selectedOrder ? (
        <div>
          <button onClick={() => setSelectedOrder(null)} style={{ marginBottom: '1rem' }}>
            ← Back to Orders
          </button>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>
                  Order #{selectedOrder.id.slice(-6)}
                  <span className={`status-badge status-${selectedOrder.status}`} style={{ marginLeft: '0.5rem' }}>
                    {selectedOrder.status}
                  </span>
                </h2>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                {selectedOrder.customerName && (
                  <p style={{ marginTop: '0.5rem' }}>Customer: {selectedOrder.customerName}</p>
                )}
                {selectedOrder.tableNumber && (
                  <p>Table: {selectedOrder.tableNumber}</p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  ${selectedOrder.totalAmount.toFixed(2)}
                </p>
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'SERVED' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {getNextStatus(selectedOrder.status) && (
                      <button
                        className="primary"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                      >
                        Move to {getNextStatus(selectedOrder.status)}
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      style={{ background: '#ffebee', color: '#c62828', borderColor: '#c62828' }}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ marginBottom: '0.5rem', marginTop: '1.5rem' }}>Order Items</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Item</th>
                  <th style={{ padding: '0.5rem' }}>Station</th>
                  <th style={{ padding: '0.5rem' }}>Quantity</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.5rem' }}>{item.menuItem.name}</td>
                    <td style={{ padding: '0.5rem' }}>{item.station.name}</td>
                    <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {item.status !== 'READY' && item.status !== 'CANCELLED' && selectedOrder.status !== 'CANCELLED' && (
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateItemStatus(selectedOrder.id, item.id, e.target.value)}
                          style={{ padding: '0.25rem', fontSize: '0.875rem' }}
                        >
                          <option value="QUEUED">QUEUED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY">READY</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ marginBottom: '0.5rem' }}>Status History</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {selectedOrder.statusHistory.map(history => (
                <div key={history.id} style={{ padding: '0.5rem', borderBottom: '1px solid #e0e0e0', fontSize: '0.9rem' }}>
                  <span className={`status-badge status-${history.fromStatus || 'CREATED'}`} style={{ marginRight: '0.5rem' }}>
                    {history.fromStatus || 'CREATED'}
                  </span>
                  →
                  <span className={`status-badge status-${history.toStatus}`} style={{ marginLeft: '0.5rem' }}>
                    {history.toStatus}
                  </span>
                  <span style={{ marginLeft: '1rem', color: '#666' }}>
                    {new Date(history.changedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {filteredOrders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No orders found. Create your first order!
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem' }}>
                        Order #{order.id.slice(-6)}
                        <span className={`status-badge status-${order.status}`} style={{ marginLeft: '0.5rem' }}>
                          {order.status}
                        </span>
                      </h3>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      {order.customerName && (
                        <p style={{ fontSize: '0.9rem' }}>Customer: {order.customerName}</p>
                      )}
                      {order.tableNumber && (
                        <p style={{ fontSize: '0.9rem' }}>Table: {order.tableNumber}</p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#666' }}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
