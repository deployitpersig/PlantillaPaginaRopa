import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, Loader2, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/admin/ProductForm';

const AdminPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      setError('Error al cargar productos. Intentá de nuevo.');
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) fetchProducts();
  }, [user, isAdmin]);

  const handleSave = async (payload, productId) => {
    setSaving(true);
    setError(null);
    try {
      if (productId) {
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...payload } : p));
        const { error: updateError } = await supabase.from('products').update(payload).eq('id', productId);
        if (updateError) {
          // Rollback on error
          await fetchProducts();
          throw updateError;
        }
      } else {
        // Insert and add to list
        const { data, error: insertError } = await supabase.from('products').insert(payload).select();
        if (insertError) throw insertError;
        if (data) {
          setProducts(prev => [data[0], ...prev]);
        }
      }
    } catch (err) {
      setError('Error al guardar el producto. Intentá de nuevo.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    // Optimistic delete
    const backup = products;
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);

    try {
      const { error: deleteError } = await supabase.from('products').delete().eq('id', id);
      if (deleteError) {
        // Rollback on error
        setProducts(backup);
        throw deleteError;
      }
    } catch (err) {
      setError('Error al eliminar el producto. Intentá de nuevo.');
      console.error('Delete error:', err);
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-sm text-gray-400">Gestión de productos</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          disabled={saving}
          className="bg-black text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="text-sm text-red-700 font-medium">{error}</span>
          </div>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-1 text-sm text-red-600 font-semibold hover:text-red-800 transition-colors"
          >
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <Package size={18} />
            </div>
            <span className="text-sm text-gray-400">Total Productos</span>
          </div>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
              <Package size={18} />
            </div>
            <span className="text-sm text-gray-400">Con Descuento</span>
          </div>
          <p className="text-3xl font-bold">{products.filter(p => p.discount).length}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <Package size={18} />
            </div>
            <span className="text-sm text-gray-400">Categorías</span>
          </div>
          <p className="text-3xl font-bold">
            {new Set(products.map(p => p.category).filter(Boolean)).size}
          </p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <span className="text-sm text-gray-400">Sin Stock</span>
          </div>
          <p className="text-3xl font-bold">{products.filter(p => (p.stock ?? 0) <= 0).length}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-4" strokeWidth={1} />
          <p className="font-medium">No hay productos todavía</p>
          <p className="text-sm mt-1">Creá tu primer producto para comenzar</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Producto</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Categoría</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Precio</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Stock</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Tag</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  return (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={18} />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-sm">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{product.category || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm">USD {Number(product.price).toFixed(2)}</span>
                        {product.original_price && (
                          <span className="text-gray-400 line-through text-xs ml-2">
                            USD {Number(product.original_price).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const stockValue = product.stock ?? 0;
                          const hasSales = (product.sold_count ?? 0) > 0;
                          const isManaged = stockValue > 0 || hasSales;
                          if (!isManaged) {
                            return (
                              <span className="inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500">
                                —
                              </span>
                            );
                          }
                          const depleted = stockValue <= 0 && hasSales;
                          return (
                            <span className={`inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${
                              depleted
                                ? 'bg-red-50 text-red-600'
                                : stockValue <= 5
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-green-50 text-green-700'
                            }`}>
                              {stockValue}
                              {depleted && <span className="text-[10px] font-semibold uppercase">agotado</span>}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        {product.tag ? (
                          <span className="bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-md font-semibold uppercase">
                            {product.tag}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {formOpen && (
        <ProductForm
          product={editingProduct}
          onClose={() => { setFormOpen(false); setEditingProduct(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold">¿Eliminar producto?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
