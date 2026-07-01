package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.entity.Banner;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.repository.BannerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BannerService {

    private final BannerRepo bannerRepo;

    @Autowired
    public BannerService(BannerRepo bannerRepo) {
        this.bannerRepo = bannerRepo;
    }

    public List<Banner> getBannersBySection(String section) {
        return bannerRepo.findBySectionAndActiveTrueOrderBySortOrderAsc(section);
    }

    public List<Banner> getAllBanners() {
        return bannerRepo.findAll();
    }

    public Banner getBannerById(Long id) {
        return bannerRepo.findById(id)
                .orElseThrow(() -> new ResourceNofFoundException("Banner", "id", id));
    }

    public Banner createBanner(Banner banner) {
        return bannerRepo.save(banner);
    }

    public Banner updateBanner(Long id, Banner bannerDetails) {
        Banner banner = getBannerById(id);
        banner.setSection(bannerDetails.getSection());
        banner.setTitle(bannerDetails.getTitle());
        banner.setSubtitle(bannerDetails.getSubtitle());
        banner.setDescription(bannerDetails.getDescription());
        banner.setImage(bannerDetails.getImage());
        banner.setBadge(bannerDetails.getBadge());
        banner.setActive(bannerDetails.getActive());
        banner.setSortOrder(bannerDetails.getSortOrder());
        return bannerRepo.save(banner);
    }

    public void deleteBanner(Long id) {
        Banner banner = getBannerById(id);
        bannerRepo.delete(banner);
    }
}
