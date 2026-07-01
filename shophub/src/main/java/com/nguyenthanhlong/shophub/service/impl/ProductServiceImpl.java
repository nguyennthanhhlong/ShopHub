package com.nguyenthanhlong.shophub.service.impl;

import com.nguyenthanhlong.shophub.entity.Cart;
import com.nguyenthanhlong.shophub.entity.Category;
import com.nguyenthanhlong.shophub.entity.Product;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.payloads.CartDTO;
import com.nguyenthanhlong.shophub.payloads.ProductDTO;
import com.nguyenthanhlong.shophub.payloads.ProductResponse;
import com.nguyenthanhlong.shophub.repository.CartRepo;
import com.nguyenthanhlong.shophub.repository.CategoryRepo;
import com.nguyenthanhlong.shophub.repository.ProductRepo;
import com.nguyenthanhlong.shophub.service.CartService;
import com.nguyenthanhlong.shophub.service.FileService;
import com.nguyenthanhlong.shophub.service.ProductService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Transactional
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepo productRepo;

    private final CategoryRepo categoryRepo;

    private final CartRepo cartRepo;

    private final CartService cartService;

    private final FileService fileService;

    private final ModelMapper modelMapper;

    @Value("${project.image}")
    private String path;

    public ProductServiceImpl(ModelMapper modelMapper, FileService fileService, CartService cartService,
            CartRepo cartRepo, CategoryRepo categoryRepo, ProductRepo productRepo) {
        this.modelMapper = modelMapper;
        this.fileService = fileService;
        this.cartService = cartService;
        this.cartRepo = cartRepo;
        this.categoryRepo = categoryRepo;
        this.productRepo = productRepo;
    }

    @Override
    public ProductDTO addProduct(Long categoryId, Product product) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNofFoundException("Category", "Category Id", categoryId));

        boolean isProductNotPresent = true;

        List<Product> products = category.getProducts();

        for (Product value : products) {
            if (value.getProductName().equals(product.getProductName())
                    && value.getProductDescription().equals(product.getProductDescription())) {
                isProductNotPresent = false;
                break;
            }
        }

        if (isProductNotPresent) {
            product.setImage("default.png");

            product.setCategory(category);

            product.setSpecialPrice(product.getSpecialPrice());

            Product savedProduct = productRepo.save(product);

            return modelMapper.map(savedProduct, ProductDTO.class);
        } else {
            throw new APIException("Product already exists!");
        }
    }

    @Override
    public ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Product> pageProducts = productRepo.findAll(pageDetails);

        List<Product> allProducts = pageProducts.getContent();

        System.out.println(modelMapper);

        List<ProductDTO> productDTOS = allProducts.stream()
                .map(product -> {
                    ProductDTO dto = new ProductDTO();
                    dto.setProductId(product.getProductId());
                    dto.setProductName(product.getProductName());
                    dto.setImage(product.getImage());
                    dto.setProductDescription(product.getProductDescription());
                    dto.setQuantity(product.getQuantity());
                    dto.setPrice(product.getPrice() != null ? product.getPrice() : 0.0);
                    dto.setDiscount(product.getDiscount() != null ? product.getDiscount() : 0.0);
                    dto.setSpecialPrice(product.getSpecialPrice() != null ? product.getSpecialPrice() : 0.0);

                    if (product.getCategory() != null) {
                        dto.setCategoryId(product.getCategory().getCategoryId());
                    }

                    return dto;
                })
                .toList();
        System.out.println(productDTOS.get(0).getCategoryId());

        ProductResponse productResponse = new ProductResponse();

        productResponse.setContent(productDTOS);
        productResponse.setPageNumber(pageProducts.getNumber());
        productResponse.setPageSize(pageProducts.getSize());
        productResponse.setTotalElements(pageProducts.getTotalElements());
        productResponse.setTotalPages(pageProducts.getTotalPages());
        productResponse.setLastPage(pageProducts.isLast());

        return productResponse;
    }

    @Override
    public ProductResponse searchByCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy,
            String sortOrder) {
        // Category category = categoryRepo.findById(categoryId)
        // .orElseThrow(() -> new ResourceNofFoundException("Category", "Category Id",
        // categoryId));

        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Product> pageProducts = productRepo.findByCategory_CategoryId(categoryId, pageDetails);

        List<Product> products = pageProducts.getContent();

        // if(products.isEmpty()) {
        // throw new APIException(category.getCategoryName() + " category does not have
        // any products!");
        // }

        List<ProductDTO> productDTOS = products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .toList();

        ProductResponse productResponse = new ProductResponse();

        productResponse.setContent(productDTOS);
        productResponse.setPageNumber(pageProducts.getNumber());
        productResponse.setPageSize(pageProducts.getSize());
        productResponse.setTotalElements(pageProducts.getTotalElements());
        productResponse.setTotalPages(pageProducts.getTotalPages());
        productResponse.setLastPage(pageProducts.isLast());

        return productResponse;
    }

    @Override
    public ProductDTO updateProduct(Long productId, Product product) {
        Product productFromDB = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "Product Id", productId));

        if (productFromDB == null) {
            throw new APIException("Product not found with id: " + productId);
        }

        product.setImage(productFromDB.getImage());
        product.setProductId(productId);
        
        if (product.getCategory() != null && product.getCategory().getCategoryId() != null) {
            Category newCategory = categoryRepo.findById(product.getCategory().getCategoryId())
                    .orElseThrow(() -> new ResourceNofFoundException("Category", "Category Id", product.getCategory().getCategoryId()));
            product.setCategory(newCategory);
        } else {
            product.setCategory(productFromDB.getCategory());
        }

        product.setSpecialPrice(product.getSpecialPrice());

        Product savedProduct = productRepo.save(product);

        List<Cart> carts = cartRepo.findCartByProductId(productId);

        List<CartDTO> cartDTOs = carts.stream().map(cart -> {
            CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);

            List<ProductDTO> products = cart.getCartItems().stream()
                    .map(p -> modelMapper.map(p.getProduct(), ProductDTO.class)).toList();

            cartDTO.setProducts(products);

            return cartDTO;
        }).toList();

        cartDTOs.forEach(cart -> cartService.updateProductInCarts(cart.getCartId(), productId));

        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    @Override
    public ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException {
        Product productFromDb = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "Product Id", productId));

        if (productFromDb == null) {
            throw new APIException("Product not found with id: " + productId);
        }

        String fileName = fileService.uploadImage(path, image);

        productFromDb.setImage(fileName);

        Product updatedProduct = productRepo.save(productFromDb);

        return modelMapper.map(updatedProduct, ProductDTO.class);
    }

    @Override
    public InputStream getProductImage(String fileName) throws FileNotFoundException {
        return fileService.getResource(path, fileName);
    }

    @Override
    public ProductResponse searchProductByKeyword(String keyword, Long categoryId, Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Product> pageProducts = (categoryId != 0 && categoryId != null)
                ? productRepo.findByProductNameContainingIgnoreCaseAndCategory_CategoryId(keyword, categoryId,
                        pageDetails)
                : productRepo.findByProductNameContainingIgnoreCase(keyword, pageDetails);

        // Page<Product> pageProducts = productRepo.findByProductNameLike(keyword,
        // pageDetails);

        List<Product> products = pageProducts.getContent();

        // if (products.isEmpty()) {
        // throw new APIException("Product not found with keyword: " + keyword);
        // }

        // tra ve san pham voi categoryId duoc loc o tren roi
        // if(categoryId != 0 && categoryId != null) {
        // products = products.stream()
        // .filter(product -> {
        // if(product.getCategory() != null && product.getCategory().getCategoryId() !=
        // null) {
        // Long productCategoryId = product.getCategory().getCategoryId();
        // return productCategoryId.equals(categoryId);
        // }
        // return false;
        // }).toList();
        // }

        List<ProductDTO> productDTOS = products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .toList();

        ProductResponse productResponse = new ProductResponse();

        productResponse.setContent(productDTOS);
        productResponse.setPageNumber(pageProducts.getNumber());
        productResponse.setPageSize(pageProducts.getSize());
        productResponse.setTotalElements(pageProducts.getTotalElements());
        productResponse.setTotalPages(pageProducts.getTotalPages());
        productResponse.setLastPage(pageProducts.isLast());

        return productResponse;
    }

    @Override
    public String deleteProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "Product Id", productId));

        List<Cart> carts = cartRepo.findCartByProductId(productId);

        carts.forEach(cart -> cartService.deleteProductFromCart(cart.getCartId(), productId));

        productRepo.delete(product);

        return "Product with productId: " + productId + " deleted successfully!";
    }

    @Override
    public ProductResponse getNewFeaturedProduct() {
        // Lấy 4 sản phẩm mới nhất
        List<Product> newestProducts = productRepo.findTop8ByOrderByProductIdDesc();

        // Chuyển đổi sang DTO
        List<ProductDTO> productDTOS = newestProducts.stream()
                .map(product -> {
                    ProductDTO dto = new ProductDTO();
                    dto.setProductId(product.getProductId());
                    dto.setProductName(product.getProductName());
                    dto.setImage(product.getImage());
                    dto.setProductDescription(product.getProductDescription());
                    dto.setQuantity(product.getQuantity());
                    dto.setPrice(product.getPrice() != null ? product.getPrice() : 0.0);
                    dto.setDiscount(product.getDiscount() != null ? product.getDiscount() : 0.0);
                    dto.setSpecialPrice(product.getSpecialPrice() != null ? product.getSpecialPrice() : 0.0);

                    if (product.getCategory() != null) {
                        dto.setCategoryId(product.getCategory().getCategoryId());
                    }

                    return dto;
                })
                .toList();

        // Tạo ProductResponse (trường hợp này không cần phân trang, nên chỉ lấy số liệu
        // cơ bản)
        ProductResponse productResponse = new ProductResponse();
        productResponse.setContent(productDTOS);
        productResponse.setPageNumber(0); // vì không phân trang
        productResponse.setPageSize(productDTOS.size());
        productResponse.setTotalElements((long) productDTOS.size());
        productResponse.setTotalPages(1);
        productResponse.setLastPage(true);

        return productResponse;
    }

    @Override
    public ProductDTO getProductById(Long productId) {
        Optional<Product> productOptional = productRepo.findById(productId);

        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            return modelMapper.map(product, ProductDTO.class);
        } else {
            throw new ResourceNofFoundException("Product", "Product Id", productId);
        }
    }
}
