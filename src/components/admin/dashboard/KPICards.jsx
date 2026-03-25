import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown } from 'lucide-react';

const KPICards = ({ metrics }) => {
  const cards = [
    {
      title: 'Ingresos (Mes)',
      value: `$${metrics.revenue.toLocaleString('es-AR')}`,
      change: metrics.revenueGrowth,
      icon: DollarSign,
      color: 'bg-black text-white'
    },
    {
      title: 'Pedidos (Mes)',
      value: metrics.orders.toLocaleString('es-AR'),
      change: metrics.ordersGrowth,
      icon: ShoppingBag,
      color: 'bg-gray-100 text-gray-900'
    },
    {
      title: 'Clientes Nuevos',
      value: metrics.customers.toLocaleString('es-AR'),
      change: metrics.customersGrowth,
      icon: Users,
      color: 'bg-gray-100 text-gray-900'
    },
    {
      title: 'Ticket Promedio',
      value: `$${metrics.avgOrderValue.toLocaleString('es-AR')}`,
      change: metrics.avgOrderGrowth,
      icon: DollarSign,
      color: 'bg-gray-100 text-gray-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.color}`}>
              <card.icon size={18} />
            </div>
            {card.change !== undefined && (
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                card.change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {card.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(card.change)}%
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm font-medium">{card.title}</p>
          <h3 className="text-2xl font-black mt-1 tracking-tight">{card.value}</h3>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
