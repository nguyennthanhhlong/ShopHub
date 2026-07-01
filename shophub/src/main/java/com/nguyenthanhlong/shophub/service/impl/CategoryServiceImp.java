package com.nguyenthanhlong.shophub.service.impl;

import com.nguyenthanhlong.shophub.entity.Category;
import com.nguyenthanhlong.shophub.entity.Product;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.payloads.CategoryDTO;
import com.nguyenthanhlong.shophub.payloads.CategoryResponse;
import com.nguyenthanhlong.shophub.repository.CategoryRepo;
import com.nguyenthanhlong.shophub.service.CategoryService;
import com.nguyenthanhlong.shophub.service.ProductService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
public class CategoryServiceImp implements CategoryService {

    private final CategoryRepo categoryRepo;

    private final ProductService productService;

    private final ModelMapper modelMapper;

    public CategoryServiceImp(CategoryRepo categoryRepo, ProductService productService, ModelMapper modelMapper) {
        this.categoryRepo = categoryRepo;
        this.productService = productService;
        this.modelMapper = modelMapper;
    }

    @Override
    public CategoryDTO createCategory(Category category) {
        Category savedCategory = categoryRepo.findByCategoryName(category.getCategoryName());

        // if (savedCategory != null) {
        // throw new APIException("Category with name " + category.getCategoryName() + "
        // already exists.");
        // }

        savedCategory = categoryRepo.save(category);

        return modelMapper.map(savedCategory, CategoryDTO.class);
    }

    @Override
    public CategoryResponse getCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Category> pageCategories = categoryRepo.findAll(pageDetails);

        List<Category> categories = pageCategories.getContent();

        // if(categories.isEmpty()) {
        // throw new APIException("No categories is created till now");
        // }

        List<CategoryDTO> categoryDTOS = categories.stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .toList();

        CategoryResponse categoryResponse = new CategoryResponse();

        categoryResponse.setContent(categoryDTOS);
        categoryResponse.setPageNumber(pageCategories.getNumber());
        categoryResponse.setPageSize(pageCategories.getSize());
        categoryResponse.setTotalElements(pageCategories.getTotalElements());
        categoryResponse.setTotalPages(pageCategories.getTotalPages());
        categoryResponse.setLastPage(pageCategories.isLast());

        return categoryResponse;
    }

    @Override
    public CategoryResponse searchCategories(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Category> pageCategories = categoryRepo.findByCategoryNameContainingIgnoreCase(keyword, pageDetails);

        List<Category> categories = pageCategories.getContent();

        List<CategoryDTO> categoryDTOS = categories.stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .toList();

        CategoryResponse categoryResponse = new CategoryResponse();

        categoryResponse.setContent(categoryDTOS);
        categoryResponse.setPageNumber(pageCategories.getNumber());
        categoryResponse.setPageSize(pageCategories.getSize());
        categoryResponse.setTotalElements(pageCategories.getTotalElements());
        categoryResponse.setTotalPages(pageCategories.getTotalPages());
        categoryResponse.setLastPage(pageCategories.isLast());

        return categoryResponse;
    }

    @Override
    public CategoryDTO updateCategory(Category category, Long categoryId) {
        Category saveCategory = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNofFoundException("Category", "Category Id", categoryId));

        category.setCategoryId(categoryId);

        saveCategory = categoryRepo.save(category);

        return modelMapper.map(saveCategory, CategoryDTO.class);
    }

    @Override
    public CategoryDTO getCategoryById(Long categoryId) {
        Optional<Category> optionalCategory = categoryRepo.findById(categoryId);

        if (optionalCategory.isPresent()) {
            Category category = optionalCategory.get();
            return modelMapper.map(category, CategoryDTO.class);
        } else {
            throw new ResourceNofFoundException("Category", "Category Id", categoryId);
        }
    }

    @Override
    public String delteCategory(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNofFoundException("Category", "Category Id", categoryId));

        List<Product> products = category.getProducts();

        products.forEach(product -> {
            ;
            productService.deleteProduct(product.getProductId());
        });

        categoryRepo.delete(category);

        return "Category with categoryId: " + categoryId + " deleted successfully.";
    }
}
