import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, ChevronLeft, ChevronRight, Inbox, X, Package, CreditCard, Calendar, User, ShoppingBag } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const getProductImage = (imageName) => {
  if (!imageName || imageName === 'default.png') return 'https://via.placeholder.com/60';
  if (imageName.startsWith('http')) return imageName;
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  return `${apiUrl}/public/products/image/${imageName}`;
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      
      // Update locally so we don't have to refetch everything
      setOrders(orders.map(o => o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update order status.');
    }
  };

  const getStatusStyle = (status) => {
    if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 focus:ring-emerald-500';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 focus:ring-amber-500';
      case 'SHIPPED': return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 focus:ring-blue-500';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 focus:ring-rose-500';
      default: return 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 focus:ring-slate-500';
    }
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedOrder(null), 200); // Wait for transition
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 mt-1">Review customer orders, update statuses, and check shipping details.</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100/60 overflow-hidden relative">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50">
          <div className="relative w-full sm:w-96 group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search by customer email..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex flex-col justify-center items-center h-64 text-blue-500">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
               <p className="text-sm font-medium animate-pulse text-slate-500">Loading orders...</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4">Order Details</th>
                  <th scope="col" className="px-6 py-4">Customer</th>
                  <th scope="col" className="px-6 py-4 text-right">Amount</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <Inbox size={48} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">No orders found</p>
                        <p className="text-sm mt-1">There are no orders matching your criteria right now.</p>
                      </div>
                    </td>
                  </tr>
                ) : orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">#ORD-{order.orderId?.toString().padStart(4, '0')}</span>
                        <span className="text-xs font-medium text-slate-500 mt-0.5">{order.orderDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-inner">
                          {getInitials(order.email)}
                        </div>
                        <span className="font-medium text-slate-700">{order.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-bold text-slate-900">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={order.orderStatus || 'PENDING'} 
                        onChange={(e) => handleStatusChange(order.email, order.orderId, e.target.value)}
                        className={`text-xs font-bold rounded-full px-3 py-1.5 outline-none cursor-pointer border ${getStatusStyle(order.orderStatus)} transition-all duration-200 appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.6rem_auto] bg-[right_0.6rem_center] bg-no-repeat`}
                      >
                        <option value="PENDING" className="bg-white text-slate-800">PENDING</option>
                        <option value="SHIPPED" className="bg-white text-slate-800">SHIPPED</option>
                        <option value="COMPLETED" className="bg-white text-slate-800">COMPLETED</option>
                        <option value="CANCELLED" className="bg-white text-slate-800">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => openModal(order)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-all"
                        >
                          <Eye size={16} />
                          <span className="text-xs font-semibold">View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-900 font-bold">{currentPage}</span> of <span className="text-slate-900 font-bold">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] animate-fade-in-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order #ORD-{selectedOrder.orderId?.toString().padStart(4, '0')}</h2>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> {selectedOrder.orderDate}
                  </p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Customer Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5"><User size={14}/> Customer Details</h3>
                  <p className="font-semibold text-slate-800 text-sm mb-1">{selectedOrder.email}</p>
                </div>
                
                {/* Payment Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5"><CreditCard size={14}/> Payment & Status</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Amount:</p>
                      <p className="font-bold text-slate-900 text-lg">${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-600 mb-1">Status:</p>
                      <span className={`inline-block text-xs font-bold rounded-full px-2.5 py-1 border ${getStatusStyle(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-blue-500" />
                  Order Items ({selectedOrder.orderItems?.length || 0})
                </h3>
                
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <ul className="divide-y divide-slate-100">
                    {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                      selectedOrder.orderItems.map((item, idx) => (
                        <li key={item.orderItemId || idx} className="p-4 flex gap-4 items-center hover:bg-slate-50 transition-colors">
                          <div className="h-16 w-16 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0">
                            <img 
                              src={getProductImage(item.product?.image)} 
                              alt={item.product?.productName || 'Product'} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{item.product?.productName || 'Unknown Product'}</h4>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">Quantity: <span className="text-slate-700 font-bold">{item.quantity}</span></p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900 text-sm">${((item.orderedProductPrice || 0) * (item.quantity || 1)).toFixed(2)}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">${(item.orderedProductPrice || 0).toFixed(2)} each</p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="p-6 text-center text-sm font-medium text-slate-500">
                        No items found in this order.
                      </li>
                    )}
                  </ul>
                  <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-100">
                    <span className="font-bold text-slate-600">Total</span>
                    <span className="font-black text-slate-900 text-lg">${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
              <button 
                onClick={closeModal}
                className="px-5 py-2 font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
