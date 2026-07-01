package com.nguyenthanhlong.shophub.repository;

import com.nguyenthanhlong.shophub.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepo extends JpaRepository<Product, Long> {
    Page<Product> findByProductNameLike(String keyword, Pageable pageDetails);

    Page<Product> findByCategory_CategoryId(Long categoryId, Pageable pageDetails);

    Page<Product> findByProductNameContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Product> findByProductNameContainingIgnoreCaseAndCategory_CategoryId(String keyword, Long categoryId,
            Pageable pageable);

    List<Product> findTop8ByOrderByProductIdDesc();

    List<Product> findByProductNameContainingIgnoreCase(String keyword);

}
