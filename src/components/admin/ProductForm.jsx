import React, { useState } from 'react';
import { X, Loader2, Image, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ProductForm = ({ product, onClose, onSave }) => {
  const isEditing = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    discount: product?.discount || '',
    image: product?.image || '',
    tag: product?.tag || '',
    stock: product?.stock ?? 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imageUrl = form.image; // fallback to existing URL

      if (imageFile) {
        // Upload image to Supabase
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const payload = {
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        discount: form.discount || null,
        image: imageUrl,
        tag: form.tag || null,
      };

      // Only include stock if user set a value (graceful if column doesn't exist yet)
      const stockValue = parseInt(form.stock, 10);
      if (!isNaN(stockValue)) {
        payload.stock = stockValue;
      }

      try {
        await onSave(payload, product?.id);
        onClose();
      } catch (err) {
        // If stock column doesn't exist, retry without it
        if (err.message && (err.message.includes('stock') || err.message.includes('column'))) {
          delete payload.stock;
          try {
            await onSave(payload, product?.id);
            onClose();
            return;
          } catch (retryErr) {
            setError(retryErr.message || 'Error al guardar el producto');
          }
        } else {
          setError(err.message || 'Error al guardar el producto');
        }
      }
    } catch (err) {
      setError(err.message || 'Error general al procesar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-lg">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nombre *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Categoría *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors bg-white appearance-none"
              >
                <option value="">Seleccionar categoría...</option>
                <option value="mens">Men's</option>
                <option value="womens">Women's</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tag</label>
              <input
                type="text"
                name="tag"
                value={form.tag}
                onChange={handleChange}
                placeholder="Ej: Top Seller"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Precio *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Precio Original</label>
              <input
                type="number"
                name="original_price"
                value={form.original_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Descuento</label>
              <input
                type="text"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                placeholder="Ej: USD 10 OFF"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Stock *</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                <span className="flex items-center gap-1"><Upload size={12} /> Imagen del Producto</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition-colors cursor-pointer"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Formatos soportados: JPG, PNG, WEBP, GIF. Tamaño máximo recomendado: 2MB.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
