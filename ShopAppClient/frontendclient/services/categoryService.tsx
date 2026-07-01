import axiosClient from '@/libraryService/axiosClient';
import { CategoryResponse } from '@/types/types';

export const getCategories = async (params = {}) => {
  try {
    const response = await axiosClient.get<CategoryResponse>('/categories', {
      params: params,
    });
    console.log(response);
    return response.data.content;
  } catch (error) {
    throw error;
  }
};
