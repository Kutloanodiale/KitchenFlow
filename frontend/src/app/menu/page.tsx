'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  available: boolean;
  estimatedTime: number;
  category: {
    id: string;
    name: string;
  };
  station: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface KitchenStation {
  id: string;
  name: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    estimatedTime: '',
    categoryId: '',
    stationId: '',
    available: true,
  });

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
    fetchStations();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/menu/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/stations');
      if (!response.ok) throw new Error('Failed to fetch stations');
      const data = await response.json();
      setStations(data);
    } catch (err) {
      console.error('Failed to load stations:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        estimatedTime: parseInt(formData.estimatedTime),
        categoryId: formData.categoryId,
        stationId: formData.stationId,
        available: formData.available,
      };

      const url = editingItem
        ? `http://localhost:4000/api/menu/${editingItem.id}`
        : 'http://localhost:4000/api/menu';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save menu item');
      }

      // Reset form and refresh
      resetForm();
      await fetchMenuItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      estimatedTime: item.estimatedTime.toString(),
      categoryId: item.category.id,
      stationId: item.station.id,
      available: item.available,
    });
    setShowForm(true);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(`http://localhost:4000/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !item.available }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update availability');
      }

      await fetchMenuItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update availability');
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/menu/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete menu item');
      }

      await fetchMenuItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete menu item');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      estimatedTime: '',
      categoryId: '',
      stationId: '',
      available: true,
    });
  };

  const filteredItems = categoryFilter === 'ALL'
    ? menuItems
    : menuItems.filter(item => item.category.id === categoryFilter);

  if (loading) {
    return <div>Loading menu...</div>;
  }

  if (error) {
    return <div style={{ color: '#f44336' }}>{error}</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Menu Management</h1>
        <button className="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Menu Item'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Classic Burger"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="12.99"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the item"
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Kitchen Station *
                </label>
                <select
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                  required
                >
                  <option value="">Select a station</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>{station.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Estimated Preparation Time (minutes) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="15"
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  <span style={{ fontWeight: 500 }}>Available for ordering</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="primary">
                {editingItem ? 'Update Item' : 'Create Item'}
              </button>
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 500, marginRight: '0.5rem' }}>Filter by Category:</span>
        <button
          onClick={() => setCategoryFilter('ALL')}
          style={{
            background: categoryFilter === 'ALL' ? '#0070f3' : '#fff',
            color: categoryFilter === 'ALL' ? '#fff' : '#333',
            borderColor: categoryFilter === 'ALL' ? '#0070f3' : '#ccc',
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            style={{
              background: categoryFilter === cat.id ? '#0070f3' : '#fff',
              color: categoryFilter === cat.id ? '#fff' : '#333',
              borderColor: categoryFilter === cat.id ? '#0070f3' : '#ccc',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '1rem', color: '#666' }}>
        Showing {filteredItems.length} of {menuItems.length} items
      </div>

      {filteredItems.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
          No menu items found. Add your first item!
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="card"
              style={{
                opacity: item.available ? 1 : 0.6,
                backgroundColor: item.available ? '#fff' : '#f5f5f5'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{item.name}</h3>
                    {!item.available && (
                      <span style={{
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}>
                        Unavailable
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p style={{ color: '#666', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                      {item.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: '#666' }}>Price: </span>
                      <span style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Category: </span>
                      <span style={{ fontWeight: 500 }}>{item.category.name}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Station: </span>
                      <span style={{ fontWeight: 500 }}>{item.station.name}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Prep Time: </span>
                      <span style={{ fontWeight: 500 }}>{item.estimatedTime} min</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      backgroundColor: item.available ? '#fff3e0' : '#e8f5e9',
                      color: item.available ? '#f57c00' : '#388e3c',
                      borderColor: item.available ? '#f57c00' : '#388e3c',
                    }}
                  >
                    {item.available ? 'Make Unavailable' : 'Make Available'}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      backgroundColor: '#ffebee',
                      color: '#c62828',
                      borderColor: '#c62828',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
