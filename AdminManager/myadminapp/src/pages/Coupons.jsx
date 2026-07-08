import React, { useState, useEffect } from "react";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from "../api/couponApi";
import { Pencil, Trash2, Plus } from "lucide-react";
import ConfirmModal from "../components/common/ConfirmModal";
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState({
    code: "",
    discountPercent: "",
    isActive: true,
    expiryDate: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      alert("Lỗi khi tải danh sách mã giảm giá.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setCurrentCoupon({ ...coupon });
      setIsEditing(true);
    } else {
      setCurrentCoupon({
        code: "",
        discountPercent: "",
        isActive: true,
        expiryDate: "",
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCoupon(currentCoupon.couponId, currentCoupon);
      } else {
        await createCoupon(currentCoupon);
      }
      handleCloseModal();
      fetchCoupons();
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi lưu mã giảm giá.";
      alert(msg);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await deleteCoupon(confirmModal.id);
      toast.success("Đã xóa mã giảm giá");
      fetchCoupons();
    } catch (error) {
      toast.error("Lỗi khi xóa mã giảm giá");
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Không có";
    return new Date(isoString).toLocaleString("vi-VN");
  };

  return (
    <div className="animate-fade-in-up p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Mã giảm giá</h1>
          <p className="text-sm text-slate-500 mt-1">Manage promotional coupons</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm Mã mới
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100/60 overflow-hidden relative">
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex flex-col justify-center items-center h-64 text-blue-500">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
               <p className="text-sm font-medium animate-pulse text-slate-500">Đang tải dữ liệu...</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-4">Mã Coupon</th>
                  <th scope="col" className="px-6 py-4">% Giảm</th>
                  <th scope="col" className="px-6 py-4">Trạng thái</th>
                  <th scope="col" className="px-6 py-4">Hạn sử dụng</th>
                  <th scope="col" className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <Plus size={48} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-bold text-slate-700">Chưa có mã giảm giá</p>
                        <p className="text-sm mt-1">Bấm "Thêm Mã mới" để tạo mã đầu tiên.</p>
                      </div>
                    </td>
                  </tr>
                ) : coupons.map((c) => (
                  <tr key={c.couponId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">{c.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-blue-600">{c.discountPercent}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${c.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}>
                        {c.isActive ? "Đang hoạt động" : "Đã tắt"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{formatDate(c.expiryDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(c)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Sửa"
                        >
                          <Pencil size={16} />
                          <span className="text-xs font-semibold">Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.couponId)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Xóa"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Sửa Mã Giảm Giá" : "Thêm Mã Giảm Giá Mới"}
            </h2>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Coupon</label>
                <input
                  type="text"
                  required
                  value={currentCoupon.code}
                  onChange={(e) => setCurrentCoupon({ ...currentCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ví dụ: SALE20"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm giảm (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={currentCoupon.discountPercent}
                  onChange={(e) => setCurrentCoupon({ ...currentCoupon, discountPercent: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                <input
                  type="datetime-local"
                  value={currentCoupon.expiryDate ? currentCoupon.expiryDate.slice(0, 16) : ""}
                  onChange={(e) => setCurrentCoupon({ ...currentCoupon, expiryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={currentCoupon.isActive}
                  onChange={(e) => setCurrentCoupon({ ...currentCoupon, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Kích hoạt mã này
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Xóa Mã Giảm Giá"
        message="Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default Coupons;
