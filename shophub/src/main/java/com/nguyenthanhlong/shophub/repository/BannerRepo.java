package com.nguyenthanhlong.shophub.repository;

import com.nguyenthanhlong.shophub.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepo extends JpaRepository<Banner, Long> {
    List<Banner> findBySectionAndActiveTrueOrderBySortOrderAsc(String section);
}
