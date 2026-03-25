import React from 'react';
import { Package, TrendingUp } from 'lucide-react';

const TopProducts = ({ products }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h3 className="text-lg font-bold">Top Productos</h3>
          <p className="text-sm text-gray-400">Los 5 más vendidos</p>
        </div>
        <button className="text-xs font-semibold text-gray-500 hover:text-black transition-colors">
          Ver todos
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5">
          {products.map((product, idx) => (
            <div key={product.id || idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={20} />
                    </div>
                  )}
                  <div className="absolute top-0 left-0 w-4 h-4 bg-black text-white text-[9px] font-bold flex items-center justify-center rounded-br-lg">
                    {idx + 1}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{product.name}</h4>
                  <p className="text-xs text-gray-400">{product.category || 'Sin categoría'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gray-900">${(product.revenue || 0).toLocaleString('es-AR')}</p>
                <p className="text-xs font-medium text-green-600 flex items-center justify-end gap-1 mt-0.5">
                  <TrendingUp size={10} /> {product.sold_count || 0} uds.
                </p>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No hay productos suficientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopProducts;
