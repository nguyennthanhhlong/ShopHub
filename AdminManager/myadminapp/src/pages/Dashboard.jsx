import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Package, TrendingDown, ArrowUpRight, Activity } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5000, orders: 35 },
  { name: 'Thu', revenue: 2780, orders: 15 },
  { name: 'Fri', revenue: 6890, orders: 48 },
  { name: 'Sat', revenue: 8390, orders: 60 },
  { name: 'Sun', revenue: 7490, orders: 55 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    revenue: 0,
    recentOrders: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axiosClient.get('/admin/users?pageSize=1'),
        axiosClient.get('/public/products?pageSize=1'),
        axiosClient.get('/admin/orders?pageSize=6')
      ]);

      const totalUsers = usersRes?.totalElements || (Array.isArray(usersRes) ? usersRes.length : 0);
      const totalProducts = productsRes?.totalElements || (Array.isArray(productsRes) ? productsRes.length : 0);
      const recentOrders = ordersRes?.content || (Array.isArray(ordersRes) ? ordersRes.slice(0, 6) : []);
      
      const revenue = recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        users: totalUsers,
        products: totalProducts,
        revenue: revenue,
        recentOrders: recentOrders
      });

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'SHIPPED': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your store today.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-slate-900 hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Activity size={18} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm p-6 border border-slate-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.users}</h3>
              <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center"><ArrowUpRight size={14} className="mr-0.5" /> +12% this month</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm p-6 border border-slate-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900">${stats.revenue.toFixed(2)}</h3>
              <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center"><ArrowUpRight size={14} className="mr-0.5" /> +4.2% today</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm p-6 border border-slate-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.products}</h3>
              <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center"><ArrowUpRight size={14} className="mr-0.5" /> +2 new items</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-6 border border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-300 mb-1">System Status</p>
              <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                Online
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-2">All services running</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 text-emerald-400 backdrop-blur-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <TrendingDown size={24} className="transform rotate-180" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Chart Section */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
              <p className="text-sm text-slate-500">Past 7 days performance</p>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col xl:h-[400px]">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
              <p className="text-sm text-slate-500">Latest transactions</p>
            </div>
            <a href="/orders" className="text-sm text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View all</a>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <Package size={48} className="mb-3 opacity-20" />
                <p>No recent orders found.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {stats.recentOrders.map((order, idx) => (
                  <li key={order.orderId || idx} className="p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                        {getInitials(order.email)}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-semibold text-slate-900 truncate">{order.email || 'Guest User'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">#{order.orderId?.toString().padStart(4, '0')} • {order.orderDate || 'Today'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
