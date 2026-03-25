import React from 'react';
import { Eye } from 'lucide-react';

const STATUS_COLORS = {
  'Entregado': 'bg-green-50 text-green-700 border-green-100',
  'En camino': 'bg-blue-50 text-blue-700 border-blue-100',
  'Procesando': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Pendiente': 'bg-gray-50 text-gray-600 border-gray-200',
};

const RecentOrders = ({ orders }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-50 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Órdenes Recientes</h3>
          <p className="text-sm text-gray-400">Últimas transacciones realizadas</p>
        </div>
        <button className="text-xs font-semibold text-gray-500 hover:text-black transition-colors">
          Ver todas
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Orden ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-semibold text-sm text-gray-900">{order.id}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                  <p className="text-xs text-gray-400">{order.items} {order.items === 1 ? 'artículo' : 'artículos'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500 font-medium">{order.date}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold">${order.total.toLocaleString('es-AR')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${STATUS_COLORS[order.status] || STATUS_COLORS['Pendiente']}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-colors ml-auto">
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
