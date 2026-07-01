import axiosClient from '@/libraryService/axiosClient';
import { Product, ProductQueryParams, ProductResponse } from '@/types/types';
import React from 'react';

/**
 * Lấy danh sách sản phẩm, xử lý logic xây dựng URL tìm kiếm theo từ khóa.
 * * @param {Object} params - Các tham số truy vấn (pageNumber, pageSize, sortBy, sortOrder, categoryId, keyword).
 * @returns {Promise<ProductResponse>} Dữ liệu sản phẩm trả về.
 */

export const getProducts = async (params: ProductQueryParams = {}) => {
  // Tách keyword khỏi các tham số query còn lại
  const { keyword, categoryId, ...queryParams } = params;
  let url: string = '/products';

  // URLSearchParams giúp xây dựng chuỗi query string an toàn
  // LƯU Ý: Phải chuyển đổi queryParams thành Record<string, any> để URLSearchParams hoạt động
  const queryString = new URLSearchParams(
    queryParams as Record<string, any>
  ).toString();

  // Kiểm tra xem có keyword hay không
  const hasKeyword = keyword && keyword.trim().length > 0;
  // Kiểm tra xem có categoryId hợp lệ (khác 'all' và khác '0') hay không
  const hasCategoryFilter =
    categoryId && categoryId !== 'all' && categoryId !== '0';

  try {
    if (hasKeyword) {
      // 1. Kịch bản CÓ TỪ KHÓA (Keyword Search)
      // Gửi cả keyword (Path Variable) và categoryId (Query Param, nếu có)

      // Nếu có categoryId, thêm nó vào query string
      let keywordQueryString = queryString;
      if (hasCategoryFilter) {
        keywordQueryString += `&categoryId=${categoryId}`;
      }

      url = `/products/keyword/${encodeURIComponent(
        keyword!
      )}?${keywordQueryString}`;
    } else if (hasCategoryFilter) {
      // 2. Kịch bản CHỈ LỌC CATEGORY (Sử dụng API mới của bạn)
      // Sử dụng Path Variable: /categories/{categoryId}/products

      url = `/categories/${categoryId}/products?${queryString}`;
    } else {
      // 3. Kịch bản MẶC ĐỊNH (Lấy tất cả, phân trang/sắp xếp)
      // Sử dụng endpoint /products thông thường
      url = `/products?${queryString}`;
    }

    console.log(`[ProductService] Fetching from: ${url}`);

    // Thực hiện cuộc gọi API
    const response = await axiosClient.get<ProductResponse>(url);
    return response;
  } catch (error) {
    console.error(`Error fetching products for URL ${url}:`, error);
    throw error;
  }
};

export const getTopProducts = async (params = {}) => {
  try {
    const response = await axiosClient.get<ProductResponse>('/products/top', {
      params: params,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getProductsByCategoryId = async (id: number, params = {}) => {
  try {
    const response = await axiosClient.get<ProductResponse>(
      `/categories/${id}/products`,
      {
        params: params,
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const getSingleProductById = async (id: number, params = {}) => {
  try {
    const response = await axiosClient.get<Product>(`/products/${id}`, {
      params: params,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
