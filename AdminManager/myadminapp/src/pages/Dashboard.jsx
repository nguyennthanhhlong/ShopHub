import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Package, TrendingDown } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    revenue: 0,
    recentOrders: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axiosClient.get('/admin/users?pageSize=1'),
        axiosClient.get('/public/products?pageSize=1'),
        axiosClient.get('/admin/orders?pageSize=5') // Fetch top 5 orders
      ]);

      // Assuming response has a 'totalElements' field for pagination
      const totalUsers = usersRes?.totalElements || (Array.isArray(usersRes) ? usersRes.length : 0);
      const totalProducts = productsRes?.totalElements || (Array.isArray(productsRes) ? productsRes.length : 0);
      const recentOrders = ordersRes?.content || (Array.isArray(ordersRes) ? ordersRes.slice(0, 5) : []);
      
      // Calculate total revenue from recent orders just as a fallback 
      // (in a real app, there would be a dedicated stats API)
      const revenue = recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        users: totalUsers,
        products: totalProducts,
        revenue: revenue,
        recentOrders: recentOrders
      });

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors">
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.users}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-800">${stats.revenue.toFixed(2)}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-green-50 text-green-600 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Total Products</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.products}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Package size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">System Status</p>
              <h3 className="text-3xl font-bold text-emerald-500 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Online
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <TrendingDown size={24} className="transform rotate-180" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <a href="/orders" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center">No recent orders.</td></tr>
              ) : stats.recentOrders.map(order => (
                <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#ORD-{order.orderId?.toString().padStart(3, '0')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{order.orderDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
