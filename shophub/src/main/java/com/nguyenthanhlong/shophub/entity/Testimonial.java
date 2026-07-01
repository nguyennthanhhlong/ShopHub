package com.nguyenthanhlong.shophub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "testimonials")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Testimonial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String role;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Integer rating = 5;

    private Boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
