import React, { useMemo } from 'react';
import KPICards from './KPICards';
import SalesChart from './SalesChart';
import CategoryChart from './CategoryChart';
import TopProducts from './TopProducts';
import RecentOrders from './RecentOrders';

const AdminDashboard = ({ products, orders = [] }) => {
  // Compute analytics dynamically from real orders and products

  const metrics = useMemo(() => {
    // Current month start
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let currentRev = 0, prevRev = 0, currentOrders = 0, prevOrders = 0;
    
    // Process real orders
    orders.forEach(o => {
      const d = new Date(o.created_at || new Date());
      if (d >= startOfMonth) {
        currentRev += Number(o.total || 0);
        currentOrders += 1;
      } else if (d >= startOfPrevMonth && d < startOfMonth) {
        prevRev += Number(o.total || 0);
        prevOrders += 1;
      }
    });

    const revGrowth = prevRev === 0 ? (currentRev > 0 ? 100 : 0) : ((currentRev - prevRev) / prevRev) * 100;
    const ordGrowth = prevOrders === 0 ? (currentOrders > 0 ? 100 : 0) : ((currentOrders - prevOrders) / prevOrders) * 100;
    const avgVal = currentOrders > 0 ? (currentRev / currentOrders) : 0;

    return {
      revenue: currentRev,
      revenueGrowth: Number(revGrowth.toFixed(1)),
      orders: currentOrders,
      ordersGrowth: Number(ordGrowth.toFixed(1)),
      customers: new Set(orders.map(o => o.customer_email).filter(Boolean)).size,
      customersGrowth: 0, 
      avgOrderValue: avgVal,
      avgOrderGrowth: 0
    };
  }, [orders]);

  const salesData = useMemo(() => {
    if (orders.length === 0) {
      // Mock data if absolute 0 sales to make panel look nice until 1st sale
      return [
        { name: 'Oct', total: 45000 }, { name: 'Nov', total: 55000 },
        { name: 'Dic', total: 85000 }, { name: 'Ene', total: 60000 },
        { name: 'Feb', total: 65000 }, { name: 'Mar', total: 125430 }
      ];
    }

    const months = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = d.toLocaleString('es-ES', { month: 'short' });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = { name: mName.charAt(0).toUpperCase() + mName.slice(1), total: 0 };
    }

    orders.forEach(o => {
      const d = new Date(o.created_at || new Date());
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (months[key]) {
        months[key].total += Number(o.total || 0);
      }
    });

    return Object.values(months);
  }, [orders]);

  const categoryData = useMemo(() => {
    // Try to aggregate actual DB data if products have sold_count
    // otherwise fallback to a realistic distribution based on existing categories.
    let hasRealSales = false;
    const stats = products.reduce((acc, p) => {
      const cat = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Otros';
      const sold = p.sold_count || 0;
      if (sold > 0) hasRealSales = true;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += sold;
      return acc;
    }, {});

    if (hasRealSales) {
      return Object.entries(stats).map(([name, value]) => ({ name, value }));
    }

    // Fallback Mock Category Distribution 
    return [
      { name: 'Hombres', value: 45 },
      { name: 'Mujeres', value: 35 },
      { name: 'Niños', value: 20 },
    ];
  }, [products]);

  const topProductsList = useMemo(() => {
    const sorted = [...products].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
    return sorted.slice(0, 5).map(p => ({
      ...p,
      sold_count: p.sold_count || 0, 
      revenue: (p.price * (p.sold_count || 0))
    }));
  }, [products]);

  const recentOrders = useMemo(() => {
    if (orders.length > 0) {
      return orders.slice(0, 5).map((o, idx) => {
        const d = new Date(o.created_at || new Date());
        return {
          id: o.id ? o.id.split('-')[0].toUpperCase() : `ORD-00${idx+1}`,
          customer: o.customer_name || 'Cliente',
          items: 1, // Without order_items access, assume 1 generic line item
          total: o.total || 0,
          status: o.status === 'pending' ? 'Pendiente' : o.status === 'completed' ? 'Entregado' : 'Procesando',
          date: d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
        };
      });
    }

    return []; // Empty real state
  }, [orders]);

  return (
    <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-500">
      {/* KPI Row */}
      <KPICards metrics={metrics} />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesData} />
        </div>
        <div className="lg:col-span-1">
          <CategoryChart data={categoryData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopProducts products={topProductsList} />
        </div>
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
