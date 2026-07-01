package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.entity.Testimonial;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.repository.TestimonialRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestimonialService {

    private final TestimonialRepo testimonialRepo;

    @Autowired
    public TestimonialService(TestimonialRepo testimonialRepo) {
        this.testimonialRepo = testimonialRepo;
    }

    public List<Testimonial> getActiveTestimonials() {
        return testimonialRepo.findByActiveTrueOrderBySortOrderAsc();
    }

    public List<Testimonial> getAllTestimonials() {
        return testimonialRepo.findAll();
    }

    public Testimonial getTestimonialById(Long id) {
        return testimonialRepo.findById(id)
                .orElseThrow(() -> new ResourceNofFoundException("Testimonial", "id", id));
    }

    public Testimonial createTestimonial(Testimonial testimonial) {
        return testimonialRepo.save(testimonial);
    }

    public Testimonial updateTestimonial(Long id, Testimonial details) {
        Testimonial testimonial = getTestimonialById(id);
        testimonial.setName(details.getName());
        testimonial.setRole(details.getRole());
        testimonial.setContent(details.getContent());
        testimonial.setRating(details.getRating());
        testimonial.setActive(details.getActive());
        testimonial.setSortOrder(details.getSortOrder());
        return testimonialRepo.save(testimonial);
    }

    public void deleteTestimonial(Long id) {
        Testimonial testimonial = getTestimonialById(id);
        testimonialRepo.delete(testimonial);
    }
}
