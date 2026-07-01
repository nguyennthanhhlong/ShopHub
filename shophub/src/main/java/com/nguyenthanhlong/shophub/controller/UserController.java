package com.nguyenthanhlong.shophub.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nguyenthanhlong.shophub.config.AppcConstants;
import com.nguyenthanhlong.shophub.payloads.UserDTO;
import com.nguyenthanhlong.shophub.payloads.UserResponse;
import com.nguyenthanhlong.shophub.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/admin/users")
    public ResponseEntity<UserResponse> getUsers(
            @RequestParam(name = "pageNumber", defaultValue = AppcConstants.PAGE_NUMBERS, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppcConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppcConstants.SORT_USERS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppcConstants.SORT_DIR, required = false) String sortOrder) {
        UserResponse userResponse = userService.getAllUsers(pageNumber == 0 ? pageNumber : pageNumber - 1, pageSize, sortBy, sortOrder);

        return new ResponseEntity<UserResponse>(userResponse, HttpStatus.OK);
    }

    @GetMapping("/admin/users/search/{keyword}")
    public ResponseEntity<UserResponse> searchUsers(
            @PathVariable String keyword,
            @RequestParam(name = "pageNumber", defaultValue = AppcConstants.PAGE_NUMBERS, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppcConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppcConstants.SORT_USERS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppcConstants.SORT_DIR, required = false) String sortOrder) {
        UserResponse userResponse = userService.searchUsers(keyword, pageNumber == 0 ? pageNumber : pageNumber - 1, pageSize, sortBy, sortOrder);

        return new ResponseEntity<UserResponse>(userResponse, HttpStatus.OK);
    }

    @GetMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable(name = "userId") Long userId) {
        UserDTO user = userService.getUserById(userId);

        return new ResponseEntity<UserDTO>(user, HttpStatus.OK);
    }

    @GetMapping("/public/users/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable(name = "email") String email) {
        try {
            UserDTO user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found for email: " + email));
        }
    }

    @PutMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> updateUser(@RequestBody UserDTO userDTO,
            @PathVariable(name = "userId") Long userId) {
        UserDTO updateUser = userService.updateUser(userId, userDTO);

        return new ResponseEntity<UserDTO>(updateUser, HttpStatus.OK);
    }

    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable(name = "userId") Long userId) {
        String status = userService.deleteUser(userId);

        return new ResponseEntity<String>(status, HttpStatus.OK);
    }

    @PostMapping("/public/users/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String message = userService.forgotPassword(email);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PutMapping("/public/users/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        String message = userService.changePassword(email, oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", message));
    }

}

