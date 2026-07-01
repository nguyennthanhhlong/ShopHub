package com.nguyenthanhlong.shophub.controller;

import com.nguyenthanhlong.shophub.config.AppcConstants;
import com.nguyenthanhlong.shophub.entity.Category;
import com.nguyenthanhlong.shophub.payloads.CategoryDTO;
import com.nguyenthanhlong.shophub.payloads.CategoryResponse;
import com.nguyenthanhlong.shophub.service.CategoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/admin/categories")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody Category category) {
        CategoryDTO saveCategory = categoryService.createCategory(category);

        return new ResponseEntity<>(saveCategory, HttpStatus.CREATED);
    }

    @GetMapping("/public/categories")
    public ResponseEntity<CategoryResponse> getCategories(
            @RequestParam(name = "pageNumber", defaultValue = AppcConstants.PAGE_NUMBERS, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppcConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppcConstants.SORT_CATEGORIES_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppcConstants.SORT_DIR, required = false) String sortOrder) {
        System.out.println(pageNumber + " " + pageSize + " " + sortBy + " " + sortOrder);
        CategoryResponse categoryResponse = categoryService.getCategories(
                pageNumber == 0 ? pageNumber : pageNumber - 1, pageSize,
                "id".equals(sortBy) ? "categoryId" : sortBy, sortOrder);

        return new ResponseEntity<>(categoryResponse, HttpStatus.OK);
    }

    @GetMapping("/public/categories/keyword/{keyword}")
    public ResponseEntity<CategoryResponse> searchCategoriesByKeyword(
            @PathVariable String keyword,
            @RequestParam(name = "pageNumber", defaultValue = AppcConstants.PAGE_NUMBERS, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppcConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppcConstants.SORT_CATEGORIES_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppcConstants.SORT_DIR, required = false) String sortOrder) {
        CategoryResponse categoryResponse = categoryService.searchCategories(keyword,
                pageNumber == 0 ? pageNumber : pageNumber - 1, pageSize,
                "id".equals(sortBy) ? "categoryId" : sortBy, sortOrder);

        return new ResponseEntity<>(categoryResponse, HttpStatus.OK);
    }

    @GetMapping("/public/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> getCategory(@PathVariable Long categoryId) {
        CategoryDTO categoryDTO = categoryService.getCategoryById(categoryId);
        return new ResponseEntity<>(categoryDTO, HttpStatus.OK);
    }

    @PutMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> updateCategory(@Valid @RequestBody Category category,
            @PathVariable Long categoryId) {
        CategoryDTO updatedCategory = categoryService.updateCategory(category, categoryId);
        return new ResponseEntity<>(updatedCategory, HttpStatus.OK);
    }

    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId) {
        String status = categoryService.delteCategory(categoryId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}
