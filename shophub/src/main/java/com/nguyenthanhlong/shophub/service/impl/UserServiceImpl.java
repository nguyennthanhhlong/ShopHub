package com.nguyenthanhlong.shophub.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import com.nguyenthanhlong.shophub.entity.Cart;
import com.nguyenthanhlong.shophub.payloads.CartDTO;
import com.nguyenthanhlong.shophub.payloads.ProductDTO;
import com.nguyenthanhlong.shophub.repository.CartRepo;
import com.nguyenthanhlong.shophub.service.CartService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.UUID;
import com.nguyenthanhlong.shophub.service.EmailService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.nguyenthanhlong.shophub.config.AppcConstants;
import com.nguyenthanhlong.shophub.entity.Address;
import com.nguyenthanhlong.shophub.entity.Role;
import com.nguyenthanhlong.shophub.entity.User;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.payloads.AddressDTO;
import com.nguyenthanhlong.shophub.payloads.UserDTO;
import com.nguyenthanhlong.shophub.payloads.UserResponse;
import com.nguyenthanhlong.shophub.repository.AddressRepo;
import com.nguyenthanhlong.shophub.repository.RoleRepo;
import com.nguyenthanhlong.shophub.repository.UserRepo;
import com.nguyenthanhlong.shophub.service.UserService;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;

    private final RoleRepo roleRepo;

    private final AddressRepo addressRepo;

    private final CartService cartService;

    private final ModelMapper modelMapper;

    private final PasswordEncoder passwordEncoder;

    private final EmailService emailService;

    public UserServiceImpl(UserRepo userRepo, RoleRepo roleRepo, AddressRepo addressRepo,
            PasswordEncoder passwordEncoder, ModelMapper modelMapper, CartService cartService, EmailService emailService) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.addressRepo = addressRepo;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
        this.cartService = cartService;
        this.emailService = emailService;
    }

    @Override
    public String deleteUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNofFoundException("User", "userId", userId));

        userRepo.delete(user);

        return "User with userId " + userId + " delete successfully!!!";
    }

    @Override
    public UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortAndOrder);

        Page<User> pageUsers = userRepo.findAll(pageDetails);

        List<User> users = pageUsers.getContent();

        if (users.isEmpty()) {
            throw new APIException("No User exists !!!");
        }

        List<UserDTO> userDTOs = users.stream().map(user -> {
            UserDTO dto = modelMapper.map(user, UserDTO.class);

            if (!user.getAddresses().isEmpty()) {
                dto.setAddress(modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));
            }

            return dto;
        }).collect(Collectors.toList());

        UserResponse userResponse = new UserResponse();

        userResponse.setContent(userDTOs);
        userResponse.setPageNumber(pageUsers.getNumber());
        userResponse.setPageSize(pageUsers.getSize());
        userResponse.setTotalElements(pageUsers.getTotalElements());
        userResponse.setTotalPages(pageUsers.getTotalPages());
        userResponse.setLastPage(pageUsers.isLast());

        return userResponse;

    }

    @Override
    public UserResponse searchUsers(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortAndOrder = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortAndOrder);

        Page<User> pageUsers = userRepo.findByEmailContainingIgnoreCase(keyword, pageDetails);

        List<User> users = pageUsers.getContent();

        List<UserDTO> userDTOs = users.stream().map(user -> {
            UserDTO dto = modelMapper.map(user, UserDTO.class);

            if (!user.getAddresses().isEmpty()) {
                dto.setAddress(modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));
            }

            return dto;
        }).collect(Collectors.toList());

        UserResponse userResponse = new UserResponse();

        userResponse.setContent(userDTOs);
        userResponse.setPageNumber(pageUsers.getNumber());
        userResponse.setPageSize(pageUsers.getSize());
        userResponse.setTotalElements(pageUsers.getTotalElements());
        userResponse.setTotalPages(pageUsers.getTotalPages());
        userResponse.setLastPage(pageUsers.isLast());

        return userResponse;
    }

    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNofFoundException("User", "userId", userId));

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        userDTO.setAddress(modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));

        return userDTO;
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNofFoundException("User", "email", email));
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            userDTO.setAddress(modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));
        }

        if (user.getCart() != null) {
            CartDTO cartDTO = modelMapper.map(user.getCart(), CartDTO.class);

            List<ProductDTO> products = user.getCart().getCartItems().stream()
                    .map(cartItem -> modelMapper.map(cartItem.getProduct(), ProductDTO.class))
                    .collect(Collectors.toList());

            cartDTO.setProducts(products);
            userDTO.setCart(cartDTO);
        }

        return userDTO;
    }

    @Override
    public UserDTO registerUser(UserDTO userDTO) {
        try {
            User user = modelMapper.map(userDTO, User.class);

            Cart cart = new Cart();

            cart.setUser(user);

            user.setCart(cart);

            Role role = roleRepo.findById(AppcConstants.USER_ID).get();

            user.getRoles().add(role);

            String country = userDTO.getAddress().getCountry();
            String state = userDTO.getAddress().getState();
            String city = userDTO.getAddress().getCity();
            String pincode = userDTO.getAddress().getPincode();
            String street = userDTO.getAddress().getStreet();
            String buildingName = userDTO.getAddress().getBuildingName();

            Address address = addressRepo
                    .findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(country, state,
                            city, pincode, street, buildingName);

            if (address == null) {
                address = new Address(pincode, city, buildingName, state, country, pincode);

                address = addressRepo.save(address);
            }

            user.setAddresses(List.of(address));

            User registerUser = userRepo.save(user);

            userDTO = modelMapper.map(registerUser, UserDTO.class);

            userDTO.setAddress(modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));

            return userDTO;

        } catch (DataIntegrityViolationException e) {
            throw new APIException("User already exists with emailId: " + userDTO.getEmail());
        }
    }

    @Override
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNofFoundException("User", "userId", userId));

        String encodePass = passwordEncoder.encode(userDTO.getPassword());

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setMobileNumber(userDTO.getMobileNumber());
        user.setEmail(userDTO.getEmail());
        user.setPassword(encodePass);

        if (userDTO.getAddress() != null) {
            String country = userDTO.getAddress().getCountry();
            String state = userDTO.getAddress().getState();
            String city = userDTO.getAddress().getCity();
            String pincode = userDTO.getAddress().getPincode();
            String street = userDTO.getAddress().getStreet();
            String buildingName = userDTO.getAddress().getBuildingName();

            Address address = addressRepo
                    .findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(country, state,
                            city, pincode, street, buildingName);

            if (address == null) {
                address = new Address(pincode, city, buildingName, state, country, pincode);

                address = addressRepo.save(address);

                user.setAddresses(List.of(address));
            }
        }

        userDTO = modelMapper.map(user, UserDTO.class);
        userDTO.setAddress(modelMapper.map(user.getAddresses().stream().findFirst().get(), AddressDTO.class));

        return userDTO;
    }

    @Override
    public String forgotPassword(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNofFoundException("User", "email", email));

        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        emailService.sendPasswordResetEmail(email, newPassword);
        return "Mật khẩu mới đã được gửi đến email của bạn.";
    }

    @Override
    public String changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNofFoundException("User", "email", email));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new APIException("Mật khẩu cũ không chính xác!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        return "Đổi mật khẩu thành công!";
    }

}
