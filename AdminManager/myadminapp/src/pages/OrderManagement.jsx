import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = searchQuery 
        ? `/admin/orders/search/${searchQuery}?pageNumber=${currentPage}&pageSize=${pageSize}`
        : `/admin/orders?pageNumber=${currentPage}&pageSize=${pageSize}`;
      const response = await axiosClient.get(url);
      if (response && response.content) {
        setOrders(response.content);
        setTotalPages(response.totalPages || 1);
      } else if (Array.isArray(response)) {
        setOrders(response);
        setTotalPages(1);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (emailId, orderId, newStatus) => {
    if (!emailId) {
      toast.error('Cannot update order without an associated email ID.');
      return;
    }
    try {
      await axiosClient.put(`/admin/users/${emailId}/orders/${orderId}/orderStatus/${newStatus}`);
      toast.success('Order status updated successfully');
      fetchOrders(); // Refresh to get updated data
    } catch (error) {
      toast.error('Failed to update order status. Please check your permissions.');
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer orders and shipments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search size={18} className="text-gray-400" />
            </span>
            <input 
              type="text" 
              placeholder="Search by email..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          {/* <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500 block outline-none">
            <option>All Statuses</option>
            <option>COMPLETED</option>
            <option>PENDING</option>
            <option>SHIPPED</option>
            <option>CANCELLED</option>
          </select> */}
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
          ) : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase text-gray-500 border-b border-gray-100 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Customer Email</th>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Total Amount</th>
                  <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  {/* <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Inbox size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium text-gray-600">No orders found</p>
                        <p className="text-sm mt-1">There are no orders matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      #ORD-{order.orderId?.toString().padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {order.orderDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={order.orderStatus || 'PENDING'} 
                        onChange={(e) => handleStatusChange(order.email, order.orderId, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 outline-none cursor-pointer border ${getStatusColor(order.orderStatus)} border-transparent focus:ring-2 focus:ring-offset-1 focus:ring-blue-500`}
                      >
                        <option value="PENDING" className="bg-white text-gray-900">PENDING</option>
                        <option value="SHIPPED" className="bg-white text-gray-900">SHIPPED</option>
                        <option value="COMPLETED" className="bg-white text-gray-900">COMPLETED</option>
                        <option value="CANCELLED" className="bg-white text-gray-900">CANCELLED</option>
                      </select>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-blue-600 mx-1 p-1.5 rounded-md hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-green-600 p-1.5 rounded-md hover:bg-green-50 transition-colors opacity-0 group-hover:opacity-100" title="Download Invoice">
                        <Download size={16} />
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
