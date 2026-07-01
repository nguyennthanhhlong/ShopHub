package com.nguyenthanhlong.shophub.controller;

import com.nguyenthanhlong.shophub.entity.Testimonial;
import com.nguyenthanhlong.shophub.service.TestimonialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TestimonialController {

    private final TestimonialService testimonialService;

    @Autowired
    public TestimonialController(TestimonialService testimonialService) {
        this.testimonialService = testimonialService;
    }

    // Public Endpoint
    @GetMapping("/public/testimonials")
    public ResponseEntity<List<Testimonial>> getActiveTestimonials() {
        return ResponseEntity.ok(testimonialService.getActiveTestimonials());
    }

    // Admin Endpoints
    @GetMapping("/admin/testimonials")
    public ResponseEntity<List<Testimonial>> getAllTestimonials() {
        return ResponseEntity.ok(testimonialService.getAllTestimonials());
    }

    @GetMapping("/admin/testimonials/{id}")
    public ResponseEntity<Testimonial> getTestimonialById(@PathVariable Long id) {
        return ResponseEntity.ok(testimonialService.getTestimonialById(id));
    }

    @PostMapping("/admin/testimonials")
    public ResponseEntity<Testimonial> createTestimonial(@RequestBody Testimonial testimonial) {
        return new ResponseEntity<>(testimonialService.createTestimonial(testimonial), HttpStatus.CREATED);
    }

    @PutMapping("/admin/testimonials/{id}")
    public ResponseEntity<Testimonial> updateTestimonial(@PathVariable Long id, @RequestBody Testimonial testimonial) {
        return ResponseEntity.ok(testimonialService.updateTestimonial(id, testimonial));
    }

    @DeleteMapping("/admin/testimonials/{id}")
    public ResponseEntity<String> deleteTestimonial(@PathVariable Long id) {
        testimonialService.deleteTestimonial(id);
        return ResponseEntity.ok("Testimonial deleted successfully");
    }
}
