import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CreditCard, Building2, Smartphone, Loader2, ShoppingBag, Package, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const STEPS = ['Datos', 'Resumen', 'Pago'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [error, setError] = useState('');

  // Customer details
  const [customer, setCustomer] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: '',
  });

  const handleCustomerChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardForm({ ...cardForm, [e.target.name]: e.target.value });
  };

  const canProceed = () => {
    if (step === 0) return customer.name && customer.email && customer.phone && customer.address;
    if (step === 1) return true;
    if (step === 2) return !!paymentMethod;
    return false;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Verify stock for all items
      const productIds = items.map(i => i.product.id);
      const { data: currentProducts, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (fetchError) throw new Error('Error verificando stock. Intentá de nuevo.');

      const stockMap = {};
      (currentProducts || []).forEach(p => { stockMap[p.id] = p; });

      // Accumulate requested quantities by product and size
      const requestsByProduct = {};
      
      for (const item of items) {
        const pid = item.product.id;
        if (!requestsByProduct[pid]) {
          requestsByProduct[pid] = { total: 0, bySize: {} };
        }
        requestsByProduct[pid].total += item.quantity;
        
        if (item.size) {
          requestsByProduct[pid].bySize[item.size] = (requestsByProduct[pid].bySize[item.size] || 0) + item.quantity;
        } else {
          requestsByProduct[pid].bySize['NO_SIZE'] = (requestsByProduct[pid].bySize['NO_SIZE'] || 0) + item.quantity;
        }
      }

      // Check stock availability
      for (const [pid, request] of Object.entries(requestsByProduct)) {
        const dbProduct = stockMap[pid];
        if (!dbProduct) {
          throw new Error('Un producto ya no está disponible.');
        }
        
        // Check size specific stock
        if (dbProduct.stock_by_size && Object.keys(dbProduct.stock_by_size).length > 0) {
          for (const [size, qty] of Object.entries(request.bySize)) {
            if (size !== 'NO_SIZE') {
              const available = dbProduct.stock_by_size[size] || 0;
              if (available < qty) {
                throw new Error(`Stock insuficiente para "${dbProduct.name}" en talle ${size}. Disponible: ${available}, pedido: ${qty}.`);
              }
            }
          }
        }
        
        // Check total stock fallback
        const currentTotalStock = dbProduct.stock ?? Infinity;
        if (currentTotalStock !== Infinity && currentTotalStock < request.total) {
          throw new Error(`Stock general insuficiente para "${dbProduct.name}". Disponible: ${currentTotalStock}, pedido: ${request.total}.`);
        }
      }

      // 2. Create order
      const orderData = {
        user_id: user?.id || null,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_address: customer.address,
        items: items.map(i => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image,
          size: i.size || null,
          color: i.color || null
        })),
        total: totalPrice,
        payment_method: paymentMethod,
        status: 'pending',
      };

      const { error: orderError } = await supabase.from('orders').insert(orderData);
      if (orderError) throw new Error('Error al crear el pedido. Intentá de nuevo.');

      // 3. Decrement stock and increment sold_count for each product
      const stockUpdates = Object.entries(requestsByProduct).map(async ([pid, request]) => {
        const dbProduct = stockMap[pid];
        const updatePayload = {};

        if (dbProduct.stock !== undefined && dbProduct.stock !== null) {
          updatePayload.stock = Math.max(0, dbProduct.stock - request.total);
        }

        if (dbProduct.stock_by_size && Object.keys(dbProduct.stock_by_size).length > 0) {
          const newStockBySize = { ...dbProduct.stock_by_size };
          for (const [size, qty] of Object.entries(request.bySize)) {
            if (size !== 'NO_SIZE' && newStockBySize[size] !== undefined) {
              newStockBySize[size] = Math.max(0, newStockBySize[size] - qty);
            }
          }
          updatePayload.stock_by_size = newStockBySize;
        }

        if (dbProduct.sold_count !== undefined && dbProduct.sold_count !== null) {
          updatePayload.sold_count = dbProduct.sold_count + request.total;
        }

        if (Object.keys(updatePayload).length > 0) {
          return supabase
            .from('products')
            .update(updatePayload)
            .eq('id', pid);
        }
      });

      await Promise.all(stockUpdates);

      clearCart();
      setOrderComplete(true);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Ocurrió un error al procesar el pedido.');
    }
    setLoading(false);
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" strokeWidth={1} />
        <h2 className="text-xl font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-sm text-gray-400 mb-6">Agregá productos antes de hacer checkout</p>
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          Ir a la tienda
        </button>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={36} />
        </div>
        <h2 className="text-2xl font-bold mb-2">¡Pedido Realizado!</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Tu pedido ha sido procesado exitosamente. Te enviaremos un email de confirmación.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="text-2xl font-bold mb-10">Checkout</h1>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 font-medium">{error}</span>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center mb-12">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${i === step ? 'text-black' : 'text-gray-400'}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 rounded ${i < step ? 'bg-green-500' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 0: Customer Details */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold mb-4">Datos del Cliente</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nombre completo *</label>
                  <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleCustomerChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Dirección *</label>
                  <input
                    type="text"
                    name="address"
                    value={customer.address}
                    onChange={handleCustomerChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Order Summary */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold mb-4">Resumen del Pedido</h2>
              <div className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">Cantidad: {quantity}</p>
                    </div>
                    <span className="font-bold text-sm">USD {(Number(product.price) * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Datos de envío</h3>
                <p className="text-sm font-semibold">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
                <p className="text-sm text-gray-500">{customer.address}</p>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-4">Método de Pago</h2>
              <div className="space-y-3">
                {/* Credit/Debit Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                    paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Tarjeta de Crédito / Débito</p>
                    <p className="text-xs text-gray-400">Visa, Mastercard, AMEX</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="ml-auto w-6 h-6 bg-black text-white rounded-full flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </button>

                {/* Card Form */}
                {paymentMethod === 'card' && (
                  <div className="pl-16 pr-4 pb-2 space-y-3">
                    <input
                      type="text"
                      name="holder"
                      placeholder="Nombre del titular"
                      value={cardForm.holder}
                      onChange={handleCardChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                    />
                    <input
                      type="text"
                      name="number"
                      placeholder="Número de tarjeta"
                      value={cardForm.number}
                      onChange={handleCardChange}
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/AA"
                        value={cardForm.expiry}
                        onChange={handleCardChange}
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                      />
                      <input
                        type="text"
                        name="cvv"
                        placeholder="CVV"
                        value={cardForm.cvv}
                        onChange={handleCardChange}
                        maxLength={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Mercado Pago */}
                <button
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                    paymentMethod === 'mercadopago' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'mercadopago' ? 'bg-[#009EE3] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Mercado Pago</p>
                    <p className="text-xs text-gray-400">Serás redirigido a Mercado Pago</p>
                  </div>
                  {paymentMethod === 'mercadopago' && (
                    <div className="ml-auto w-6 h-6 bg-[#009EE3] text-white rounded-full flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </button>

                {/* Bank Transfer */}
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                    paymentMethod === 'transfer' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'transfer' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Transferencia Bancaria</p>
                    <p className="text-xs text-gray-400">CBU / Alias — confirmación manual</p>
                  </div>
                  {paymentMethod === 'transfer' && (
                    <div className="ml-auto w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </button>

                {paymentMethod === 'transfer' && (
                  <div className="pl-16 pr-4 pb-2">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                      <p className="font-semibold mb-2">Datos para transferencia:</p>
                      <p>Banco: Banco Nación</p>
                      <p>CBU: 0110099030009900112233</p>
                      <p>Alias: HOODIE.STORE</p>
                      <p className="mt-2 text-xs text-green-600">Enviá el comprobante a pedidos@hoodie.com</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button
                onClick={() => { setStep(step - 1); setError(''); }}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} /> Anterior
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-black text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Siguiente <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !paymentMethod}
                className="bg-black text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                Realizar Pedido
              </button>
            )}
          </div>
        </div>

        {/* Side Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
            <h3 className="font-bold mb-4">Tu Pedido</h3>
            <div className="space-y-3 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 truncate mr-2">{product.name} ×{quantity}</span>
                  <span className="font-semibold flex-shrink-0">USD {(Number(product.price) * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">USD {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
