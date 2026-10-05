'use client';

import { useState, useEffect } from 'react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

interface InventoryMovement {
  id: string;
  ingredientId: string;
  quantityChange: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
  ingredient: {
    name: string;
    unit: string;
  };
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [lowStockIngredients, setLowStockIngredients] = useState<Ingredient[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [showMovements, setShowMovements] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIngredients();
    fetchLowStock();
    fetchMovements();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/inventory/ingredients');
      if (!response.ok) throw new Error('Failed to fetch ingredients');
      const data = await response.json();
      setIngredients(data);
      setError(null);
    } catch (err) {
      setError('Failed to load ingredients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/inventory/ingredients/low-stock');
      if (!response.ok) throw new Error('Failed to fetch low stock');
      const data = await response.json();
      setLowStockIngredients(data);
    } catch (err) {
      console.error('Failed to load low stock ingredients:', err);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/inventory/movements');
      if (!response.ok) throw new Error('Failed to fetch movements');
      const data = await response.json();
      setMovements(data);
    } catch (err) {
      console.error('Failed to load movements:', err);
    }
  };

  const isLowStock = (ingredient: Ingredient): boolean => {
    return ingredient.currentStock <= ingredient.minStock;
  };

  const getStockPercentage = (ingredient: Ingredient): number => {
    return Math.min((ingredient.currentStock / (ingredient.minStock * 2)) * 100, 100);
  };

  const getStockColor = (ingredient: Ingredient): string => {
    if (ingredient.currentStock <= ingredient.minStock) return '#f44336';
    if (ingredient.currentStock <= ingredient.minStock * 1.5) return '#ff9800';
    return '#4caf50';
  };

  const getMovementReasonLabel = (reason: string): string => {
    switch (reason) {
      case 'ORDER_CONFIRMED': return 'Order Confirmed';
      case 'STOCK_ADJUSTMENT': return 'Stock Adjustment';
      case 'STOCK_CORRECTION': return 'Stock Correction';
      case 'INITIAL_STOCK': return 'Initial Stock';
      default: return reason;
    }
  };

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  if (error) {
    return <div style={{ color: '#f44336' }}>{error}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Inventory Management</h1>
        <p style={{ color: '#666' }}>
          {ingredients.length} ingredients tracked
          {lowStockIngredients.length > 0 && (
            <span style={{ color: '#f44336', marginLeft: '1rem', fontWeight: 'bold' }}>
              ⚠ {lowStockIngredients.length} low stock
            </span>
          )}
        </p>
      </div>

      {lowStockIngredients.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#ffebee', borderColor: '#f44336' }}>
          <h2 style={{ color: '#c62828', marginBottom: '1rem' }}>⚠ Low Stock Alert</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {lowStockIngredients.map(ingredient => (
              <div key={ingredient.id} style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#c62828' }}>{ingredient.name}</h3>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                  Current: {ingredient.currentStock} {ingredient.unit}
                  <br />
                  Minimum: {ingredient.minStock} {ingredient.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Ingredients</h2>
        <button onClick={() => setShowMovements(!showMovements)}>
          {showMovements ? 'Show Ingredients' : 'View Movement History'}
        </button>
      </div>

      {showMovements ? (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Recent Inventory Movements</h3>
          {movements.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No inventory movements recorded yet
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {movements.map(movement => (
                <div key={movement.id} className="card" style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>
                        {movement.ingredient.name}
                      </h4>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        <span style={{
                          fontWeight: 600,
                          color: movement.quantityChange > 0 ? '#4caf50' : '#f44336'
                        }}>
                          {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange} {movement.ingredient.unit}
                        </span>
                        <span style={{ marginLeft: '1rem' }}>
                          Reason: {getMovementReasonLabel(movement.reason)}
                        </span>
                        {movement.referenceId && (
                          <span style={{ marginLeft: '1rem' }}>
                            Ref: #{movement.referenceId.slice(-6)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                      {new Date(movement.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {ingredients.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No ingredients found. Add ingredients to get started.
            </p>
          ) : (
            ingredients.map(ingredient => {
              const lowStock = isLowStock(ingredient);
              const stockPercentage = getStockPercentage(ingredient);
              const stockColor = getStockColor(ingredient);

              return (
                <div
                  key={ingredient.id}
                  className="card"
                  style={{
                    borderColor: lowStock ? '#f44336' : '#e0e0e0',
                    backgroundColor: lowStock ? '#ffebee' : '#fff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>{ingredient.name}</h3>
                      {lowStock && (
                        <span style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          LOW STOCK
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: stockColor }}>
                        {ingredient.currentStock} {ingredient.unit}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                        Min: {ingredient.minStock} {ingredient.unit}
                      </p>
                    </div>
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
                        width: `${stockPercentage}%`,
                        height: '100%',
                        backgroundColor: stockColor,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                    Stock level: {Math.round((ingredient.currentStock / ingredient.minStock) * 100)}% of minimum
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
