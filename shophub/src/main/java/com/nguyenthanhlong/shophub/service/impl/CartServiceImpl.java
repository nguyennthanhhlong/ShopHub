package com.nguyenthanhlong.shophub.service.impl;

import com.nguyenthanhlong.shophub.entity.Cart;
import com.nguyenthanhlong.shophub.entity.CartItem;
import com.nguyenthanhlong.shophub.entity.Product;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.payloads.CartDTO;
import com.nguyenthanhlong.shophub.payloads.ProductDTO;
import com.nguyenthanhlong.shophub.repository.CartItemRepo;
import com.nguyenthanhlong.shophub.repository.CartRepo;
import com.nguyenthanhlong.shophub.repository.ProductRepo;
import com.nguyenthanhlong.shophub.service.CartService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Transactional
@Service
public class CartServiceImpl implements CartService {

    private final CartRepo cartRepo;

    private final ProductRepo productRepo;

    private final CartItemRepo cartItemRepo;

    private final ModelMapper modelMapper;

    public CartServiceImpl(CartRepo cartRepo, ProductRepo productRepo, CartItemRepo cartItemRepo,
            ModelMapper modelMapper) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
        this.cartItemRepo = cartItemRepo;
        this.modelMapper = modelMapper;
    }

    @Override
    public CartDTO addProductToCart(Long cartId, Long productId, Integer quantity) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNofFoundException("Cart", "cartId", cartId));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "productId", productId));

        List<CartItem> existingItems = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
        CartItem existingItem = existingItems.isEmpty() ? null : existingItems.get(0);
        // if (existingItem != null) {
        // throw new APIException("Product " + product.getProductName() + " is already
        // in cart");
        // }

        if (product.getQuantity() == 0) {
            throw new APIException("Product " + product.getProductName() + " is out of stock");
        }

        if (product.getQuantity() < quantity) {
            throw new APIException("Please order <= " + product.getQuantity() + " for " + product.getProductName());
        }

        // 🟢 Tạo cart item mới
        CartItem newCartItem = new CartItem();
        newCartItem.setProduct(product);
        newCartItem.setQuantity(quantity);
        newCartItem.setCart(cart);
        newCartItem.setDiscount(product.getDiscount());

        double activePrice = product.getSpecialPrice() != null && product.getSpecialPrice() > 0
                ? product.getSpecialPrice()
                : (product.getPrice() != null ? product.getPrice() : 0.0);
        newCartItem.setProductPrice(activePrice);

        // 🟢 Cập nhật quan hệ 2 chiều
        cart.getCartItems().add(newCartItem);

        // 🟢 Cập nhật số lượng và tổng tiền
        product.setQuantity(product.getQuantity() - quantity);
        cart.setTotalPrice(cart.getTotalPrice() + (activePrice * quantity));

        // 🟢 Lưu cả 2
        cartItemRepo.save(newCartItem);
        cartRepo.save(cart);

        // 🟢 Convert sang DTO
        List<ProductDTO> productDTOS = cart.getCartItems().stream()
                .map(item -> modelMapper.map(item.getProduct(), ProductDTO.class))
                .toList();

        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
        cartDTO.setProducts(productDTOS);

        return cartDTO;
    }

    @Override
    public List<CartDTO> getAllCarts() {
        List<Cart> carts = cartRepo.findAll();

        if (carts.isEmpty()) {
            throw new APIException("No carts found");
        }

        List<CartDTO> cartDTOS = carts.stream().map(cart -> {
            CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
            List<ProductDTO> productDTOS = cart.getCartItems().stream()
                    .map(cartItem -> modelMapper.map(cartItem.getProduct(), ProductDTO.class)).toList();
            cartDTO.setProducts(productDTOS);
            return cartDTO;
        }).toList();

        return cartDTOS;
    }

    @Override
    public CartDTO getCart(String emailId, Long cartId) {
        Cart cart = cartRepo.findCartByEmailAndCartId(emailId, cartId);

        if (cart == null) {
            throw new ResourceNofFoundException("Cart", "cartId", cartId);
        }

        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);

        List<ProductDTO> productDTOS = cart.getCartItems().stream()
                .map(cartItem -> modelMapper.map(cartItem.getProduct(), ProductDTO.class)).toList();
        cartDTO.setProducts(productDTOS);
        return cartDTO;
    }

    @Override
    public CartDTO updateProductQuantityInCart(Long cartId, Long productId, Integer quantity) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNofFoundException("Cart", "cartId", cartId));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "productId", productId));

        if (product.getQuantity() == 0) {
            throw new APIException("Product " + product.getProductName() + " is out of stock");
        }

        if (product.getQuantity() < quantity) {
            throw new APIException("Please make an order of the " + product.getProductName() + " less than or equal to "
                    + product.getQuantity());
        }

        List<CartItem> existingItems = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
        CartItem cartItem = existingItems.isEmpty() ? null : existingItems.get(0);

        if (cartItem == null) {
            throw new APIException("Product " + product.getProductName() + " is not exist in cart");
        }

        double cartPrice = cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity());

        product.setQuantity(product.getQuantity() + cartItem.getQuantity() - quantity);

        double activePrice = product.getSpecialPrice() != null && product.getSpecialPrice() > 0
                ? product.getSpecialPrice()
                : (product.getPrice() != null ? product.getPrice() : 0.0);
        cartItem.setProductPrice(activePrice);
        cartItem.setQuantity(quantity);
        cartItem.setDiscount(product.getDiscount());

        cart.setTotalPrice(cartPrice + (activePrice * quantity));

        cartItem = cartItemRepo.save(cartItem);

        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);

        List<ProductDTO> productDTOS = cart.getCartItems().stream()
                .map(p -> modelMapper.map(p.getProduct(), ProductDTO.class)).toList();

        cartDTO.setProducts(productDTOS);

        return cartDTO;
    }

    @Override
    public void updateProductInCarts(Long cartId, Long productId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNofFoundException("Cart", "cartId", cartId));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNofFoundException("Product", "productId", productId));

        List<CartItem> existingItems = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
        CartItem cartItem = existingItems.isEmpty() ? null : existingItems.get(0);

        if (cartItem == null) {
            throw new APIException("Product " + product.getProductName() + " is not exist in cart");
        }

        double cartPrice = cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity());

        double activePrice = product.getSpecialPrice() != null && product.getSpecialPrice() > 0
                ? product.getSpecialPrice()
                : (product.getPrice() != null ? product.getPrice() : 0.0);
        cartItem.setProductPrice(activePrice);

        cart.setTotalPrice(cartPrice + (activePrice * cartItem.getQuantity()));

        cartItem = cartItemRepo.save(cartItem);
    }

    @Override
    public String deleteProductFromCart(Long cartId, Long productId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNofFoundException("Cart", "cartId", cartId));

        List<CartItem> existingItems = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
        CartItem cartItem = existingItems.isEmpty() ? null : existingItems.get(0);

        if (cartItem == null) {
            return "Product " + productId + " is already removed from cart.";
        }

        cart.setTotalPrice(cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity()));

        Product product = cartItem.getProduct();

        product.setQuantity(product.getQuantity() + cartItem.getQuantity());

        cartItemRepo.deleteCartItemByProductIdAndCartId(cartId, productId);

        return "Product " + cartItem.getProduct().getProductName() + " has been removed from cart successfully.";
    }
}
