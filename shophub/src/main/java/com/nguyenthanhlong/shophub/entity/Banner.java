package com.nguyenthanhlong.shophub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String section;

    private String title;

    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String image;

    private String badge;

    private Boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
