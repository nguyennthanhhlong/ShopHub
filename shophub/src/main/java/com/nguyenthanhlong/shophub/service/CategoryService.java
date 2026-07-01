package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.entity.Category;
import com.nguyenthanhlong.shophub.payloads.CategoryDTO;
import com.nguyenthanhlong.shophub.payloads.CategoryResponse;

public interface CategoryService {

    CategoryDTO createCategory(Category category);

    CategoryResponse getCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    CategoryResponse searchCategories(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    CategoryDTO updateCategory(Category category, Long categoryId);

    CategoryDTO getCategoryById(Long categoryId);

    String delteCategory(Long categoryId);
}
