import React, { useState } from 'react';
import { X, Loader2, Upload, Package, DollarSign, Tag, Layers, ImageIcon, Sparkles, Palette, Ruler, BadgeCheck, FileText, Hash, Trash2 } from 'lucide-react';
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

const ChipInput = ({ label, icon: Icon, values, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const addChip = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
  };

  const removeChip = (idx) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
        <Icon size={11} /> {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-md font-medium">
            {v}
            <button type="button" onClick={() => removeChip(idx)} className="text-gray-400 hover:text-white ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChip(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-300"
        />
        <button
          type="button"
          onClick={addChip}
          className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

const ProductForm = ({ product, onClose, onSave }) => {
  const isEditing = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    code: product?.code || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    price_without_tax: product?.price_without_tax || '',
    discount: product?.discount || '',
    description: product?.description || '',
    image: product?.image || '',
    tag: product?.tag || '',
    stock: product?.stock ?? 0,
    new_collection: product?.new_collection ?? false,
    colors: product?.colors || [],
    sizes: product?.sizes || [],
    badges: product?.badges || [],
  });

  // Multi-image support
  const existingImages = product?.images || (product?.image ? [product.image] : []);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(existingImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const availableSubcategories = SUBCATEGORIES[form.category] || [];

  const handleImagesChange = (files) => {
    const fileArray = Array.from(files);
    const newPreviews = fileArray.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...fileArray]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImagesChange(e.target.files);
      e.target.value = '';
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImagesChange(e.dataTransfer.files);
    }
  };

  const removeImage = (idx) => {
    const isExisting = idx < existingImages.length;
    if (isExisting) {
      // Removing an existing (already uploaded) image
      setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    } else {
      // Removing a newly added file
      const fileIdx = idx - existingImages.length;
      const adjustedFileIdx = idx - (imagePreviews.length - imageFiles.length);
      setImageFiles(prev => prev.filter((_, i) => i !== (idx - (imagePreviews.length - imageFiles.length))));
      setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    if (name === 'category') {
      updated.subcategory = '';
    }

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

    // Validation
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    if (!form.price) { setError('El precio es obligatorio'); return; }
    if (imagePreviews.length === 0 && imageFiles.length === 0) { setError('Agregá al menos una imagen'); return; }

    setLoading(true);

    try {
      // Upload new image files
      const uploadedUrls = [];
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
        if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }

      // Combine existing kept images + newly uploaded
      const keptExisting = imagePreviews.filter(url => existingImages.includes(url));
      const allImages = [...keptExisting, ...uploadedUrls];

      const payload = {
        name: form.name,
        code: form.code || null,
        category: form.category,
        subcategory: form.subcategory || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        price_without_tax: form.price_without_tax ? parseFloat(form.price_without_tax) : null,
        discount: form.discount || null,
        description: form.description || null,
        image: allImages[0] || null,
        images: allImages,
        tag: form.tag || null,
        new_collection: !!form.new_collection,
        colors: form.colors.length > 0 ? form.colors : [],
        sizes: form.sizes.length > 0 ? form.sizes : [],
        badges: form.badges.length > 0 ? form.badges : [],
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
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
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

        <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Multi-Image Upload Area */}
          <div>
            <label className={labelClass}><ImageIcon size={11} /> Imágenes *</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                dragActive ? 'ring-2 ring-black ring-offset-2' : ''
              }`}
            >
              {/* Image previews grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 size={10} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">PRINCIPAL</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                dragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
              }`}>
                <div className="flex items-center gap-3 text-gray-400">
                  <Upload size={18} />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">Arrastrá o hacé clic para subir imágenes</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">JPG, PNG, WEBP — múltiples archivos</p>
                  </div>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
              </label>
            </div>
          </div>

          {/* Product Name + Code */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className={labelClass}><Package size={11} /> Nombre *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Nombre del producto" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Hash size={11} /> Código</label>
              <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="SKU-001" className={inputClass} />
            </div>
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
                <select name="subcategory" value={form.subcategory} onChange={handleChange} disabled={!form.category} className={`${selectClass} ${!form.category ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                type="number" name="price" value={form.price} onChange={handleChange} required step="0.01" min="0" placeholder="Auto"
                readOnly={!!(form.original_price && form.discount)}
                className={`${inputClass} ${form.original_price && form.discount ? 'bg-green-50 border-green-200 text-green-700 font-semibold' : ''}`}
              />
            </div>
            <div>
              <label className={labelClass}><DollarSign size={11} /> Sin Impuestos</label>
              <input type="number" name="price_without_tax" value={form.price_without_tax} onChange={handleChange} step="0.01" min="0" placeholder="0.00" className={inputClass} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}><FileText size={11} /> Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Descripción del producto (características, materiales, etc.)"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Colors */}
          <ChipInput
            label="Colores disponibles"
            icon={Palette}
            values={form.colors}
            onChange={(colors) => setForm(prev => ({ ...prev, colors }))}
            placeholder="Ej: Negro, Blanco, Rojo"
          />

          {/* Sizes */}
          <ChipInput
            label="Talles disponibles"
            icon={Ruler}
            values={form.sizes}
            onChange={(sizes) => setForm(prev => ({ ...prev, sizes }))}
            placeholder="Ej: S, M, L, XL"
          />

          {/* Badges */}
          <ChipInput
            label="Badges / Etiquetas"
            icon={BadgeCheck}
            values={form.badges}
            onChange={(badges) => setForm(prev => ({ ...prev, badges }))}
            placeholder="Ej: PRODUCTO IMPORTADO"
          />

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
