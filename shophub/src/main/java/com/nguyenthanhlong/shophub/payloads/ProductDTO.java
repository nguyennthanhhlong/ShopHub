package com.nguyenthanhlong.shophub.payloads;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Long productId;
    private String productName;
    private String image;
    private String productDescription;
    private Integer quantity;
    private double price;
    private double discount;
    private double specialPrice;

    private Long categoryId;
}
