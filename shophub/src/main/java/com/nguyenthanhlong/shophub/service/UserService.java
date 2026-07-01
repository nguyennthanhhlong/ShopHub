package com.nguyenthanhlong.shophub.service;

import com.nguyenthanhlong.shophub.payloads.UserDTO;
import com.nguyenthanhlong.shophub.payloads.UserResponse;

public interface UserService {
    UserDTO registerUser(UserDTO userDTO);

    UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    UserResponse searchUsers(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    UserDTO getUserById(Long userId);

    UserDTO getUserByEmail(String email);

    UserDTO updateUser(Long userId, UserDTO userDTO);

    String deleteUser(Long userId);

    String forgotPassword(String email);

    String changePassword(String email, String oldPassword, String newPassword);
}
