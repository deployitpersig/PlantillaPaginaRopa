import React, { useState } from 'react';
import { X, Loader2, Upload, Package, DollarSign, Tag, Layers, ImageIcon, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SUBCATEGORIES = {
  mens: ['T-Shirts', 'Polo Shirts', 'Hoodies', 'Jackets', 'Jeans', 'Pants', 'Shorts', 'Suits', 'Swimwear', 'Socks', 'Accessories'],
  womens: ['T-Shirts', 'Tops', 'Blouses', 'Hoodies', 'Jackets', 'Dresses', 'Skirts', 'Jeans', 'Pants', 'Shorts', 'Underwear', 'Swimwear', 'Jumpsuits', 'Socks & Tights', 'Accessories'],
  kids: ['T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Jeans', 'Pants & Leggings', 'Shorts', 'Dresses', 'Skirts', 'Underwear', 'Swimwear', 'Socks', 'Accessories'],
};

const CATEGORY_LABELS = {
  mens: "Men's",
  womens: "Women's",
  kids: "Kids",
};

const ProductForm = ({ product, onClose, onSave }) => {
  const isEditing = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    discount: product?.discount || '',
    image: product?.image || '',
    tag: product?.tag || '',
    stock: product?.stock ?? 0,
    new_collection: product?.new_collection ?? false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const availableSubcategories = SUBCATEGORIES[form.category] || [];

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    if (name === 'category') {
      updated.subcategory = '';
    }

    // Auto-calculate discounted price when original_price or discount changes
    if (name === 'original_price' || name === 'discount') {
      const origPrice = parseFloat(name === 'original_price' ? value : form.original_price);
      const discountVal = parseFloat(name === 'discount' ? value : form.discount);
      if (!isNaN(origPrice) && origPrice > 0 && !isNaN(discountVal) && discountVal > 0) {
        updated.price = (origPrice - (origPrice * discountVal / 100)).toFixed(2);
      }
    }

    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imageUrl = form.image;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error(`Error al subir imagen: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const payload = {
        name: form.name,
        category: form.category,
        subcategory: form.subcategory || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        discount: form.discount || null,
        image: imageUrl,
        tag: form.tag || null,
        new_collection: !!form.new_collection,
      };

      const stockValue = parseInt(form.stock, 10);
      if (!isNaN(stockValue)) {
        payload.stock = stockValue;
      }

      try {
        await onSave(payload, product?.id);
        onClose();
      } catch (err) {
        if (err.message && (err.message.includes('stock') || err.message.includes('column') || err.message.includes('subcategory'))) {
          delete payload.stock;
          delete payload.subcategory;
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

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black/5 transition-all placeholder:text-gray-300";
  const selectClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black/5 transition-all appearance-none cursor-pointer";
  const labelClass = "flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideDown 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 bg-gradient-to-r from-gray-900 to-gray-800">
          <div>
            <h2 className="font-bold text-lg text-white">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {isEditing ? 'Modificá los campos que necesites' : 'Completá los datos del producto'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[65vh] overflow-y-auto text-center">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Image Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-2xl overflow-hidden transition-all ${
              dragActive ? 'ring-2 ring-black ring-offset-2' : ''
            }`}
          >
            {imagePreview ? (
              <div className="relative group cursor-pointer">
                <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-white">
                    <Upload size={24} />
                    <span className="text-sm font-medium">Cambiar imagen</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                dragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
              }`}>
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon size={20} className="text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">Arrastrá o hacé clic para subir</p>
                    <p className="text-[10px] text-gray-300 mt-1">JPG, PNG, WEBP — máx 2MB</p>
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className={labelClass}><Package size={11} /> Nombre *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Nombre del producto"
              className={inputClass}
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><Layers size={11} /> Categoría *</label>
              <div className="relative">
                <select name="category" value={form.category} onChange={handleChange} required className={selectClass}>
                  <option value="">Seleccionar...</option>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}><Layers size={11} /> Subcategoría</label>
              <div className="relative">
                <select
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  disabled={!form.category}
                  className={`${selectClass} ${!form.category ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">{form.category ? 'Seleccionar...' : 'Elegí categoría primero'}</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* New Collection Toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <Sparkles size={14} className="text-amber-500" />
              New Collection
            </label>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, new_collection: !prev.new_collection }))}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                form.new_collection ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                form.new_collection ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}><DollarSign size={11} /> Precio Original</label>
              <input type="number" name="original_price" value={form.original_price} onChange={handleChange} step="0.01" min="0" placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Tag size={11} /> Descuento %</label>
              <input type="number" name="discount" value={form.discount} onChange={handleChange} step="1" min="0" max="100" placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><DollarSign size={11} /> Precio Final *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                placeholder="Auto"
                readOnly={!!(form.original_price && form.discount)}
                className={`${inputClass} ${form.original_price && form.discount ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : ''}`}
              />
              {form.original_price && form.discount && (
                <p className="text-[10px] text-green-500 mt-1 font-medium">Calculado automáticamente</p>
              )}
            </div>
          </div>

          {/* Tag & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><Tag size={11} /> Tag / Etiqueta</label>
              <input type="text" name="tag" value={form.tag} onChange={handleChange} placeholder="Ej: Top Seller" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Package size={11} /> Stock</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" step="1" placeholder="0" className={inputClass} />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 rounded-full font-semibold hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3 shadow-lg shadow-gray-900/20 active:scale-[0.98]"
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
