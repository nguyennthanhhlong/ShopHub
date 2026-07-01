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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Mã giảm giá</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          Thêm Mã mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Coupon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Giảm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn sử dụng</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((c) => (
                <tr key={c.couponId}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{c.discountPercent}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        c.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.isActive ? "Đang hoạt động" : "Đã tắt"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(c.expiryDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleOpenModal(c)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Pencil className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.couponId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
