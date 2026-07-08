import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Shield, User as UserIcon, X, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: ''
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery]);

  const getCurrentUserEmail = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email;
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
    return null;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/admin/users/search/${searchQuery}?pageNumber=${currentPage}&pageSize=${pageSize}`
        : `/admin/users?pageNumber=${currentPage}&pageSize=${pageSize}`;
      const response = await axiosClient.get(url);
      
      const currentUserEmail = getCurrentUserEmail();
      
      if (response && response.content) {
        setUsers(response.content.filter(u => u.email !== currentUserEmail));
        setTotalPages(response.totalPages || 1);
      } else if (Array.isArray(response)) {
        setUsers(response.filter(u => u.email !== currentUserEmail));
        setTotalPages(1);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (userId) => {
    setConfirmModal({ isOpen: true, id: userId });
  };

  const confirmDelete = async () => {
    try {
      await axiosClient.delete(`/admin/users/${confirmModal.id}`);
      toast.success('User deactivated successfully');
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to deactivate user. Please check your permissions.');
    }
  };

  const openEditModal = (user) => {
    setCurrentUser({
      userId: user.userId,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      mobileNumber: user.mobileNumber || '',
      email: user.email || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/public/users/${currentUser.userId}`, {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        mobileNumber: currentUser.mobileNumber,
        email: currentUser.email
      });
      toast.success('User profile updated successfully');
      closeModal();
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user profile.');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system users, roles, and profiles</p>
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
              placeholder="Search by email..." 
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
               <p className="text-sm font-medium animate-pulse text-slate-500">Loading users...</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4">User</th>
                  <th scope="col" className="px-6 py-4">Contact</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <Inbox size={48} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">No users found</p>
                        <p className="text-sm mt-1">There are no users matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-indigo-600 flex items-center justify-center font-bold uppercase shadow-inner">
                          {(user.firstName?.[0] || '')}{(user.lastName?.[0] || '')}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{user.firstName} {user.lastName}</span>
                          <span className="text-xs font-medium text-slate-500 mt-0.5">ID: #{user.userId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{user.email}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{user.mobileNumber || 'No phone number'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100" 
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                          <span className="text-xs font-semibold">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(user.userId)} 
                          className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100" 
                          title="Deactivate"
                        >
                          <Trash2 size={16} />
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
        {!loading && users.length > 0 && (
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

          <div className="bg-white rounded-xl shadow-2xl transform transition-all w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSave}>
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit User Profile
                </h3>
                <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                      value={currentUser.firstName}
                      onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                      value={currentUser.lastName}
                      onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                      value={currentUser.email}
                      onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                      value={currentUser.mobileNumber}
                      onChange={(e) => setCurrentUser({...currentUser, mobileNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deactivate Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Deactivate User"
        message="Are you sure you want to deactivate this user? They will not be able to log in."
        confirmText="Deactivate"
      />
    </div>
  );
}
