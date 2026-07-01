package com.nguyenthanhlong.shophub.repository;

import com.nguyenthanhlong.shophub.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryRepo extends JpaRepository<Category, Long> {
    Category findByCategoryName(String categoryName);

    Page<Category> findByCategoryNameContainingIgnoreCase(String keyword, Pageable pageable);
}
