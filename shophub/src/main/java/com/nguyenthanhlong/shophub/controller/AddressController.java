package com.nguyenthanhlong.shophub.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.nguyenthanhlong.shophub.entity.Address;
import com.nguyenthanhlong.shophub.payloads.AddressDTO;
import com.nguyenthanhlong.shophub.service.AddressService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = "E-Commerce Application")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping("/address")
    public ResponseEntity<AddressDTO> createAddress(@Valid @RequestBody AddressDTO addressDTO) {
        AddressDTO savAddressDTO = addressService.createAddress(addressDTO);

        return new ResponseEntity<AddressDTO>(savAddressDTO, HttpStatus.CREATED);
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<AddressDTO>> getAddresses() {
        List<AddressDTO> addresses = addressService.getAddresses();

        return new ResponseEntity<List<AddressDTO>>(addresses, HttpStatus.FOUND);
    }

    @GetMapping("/addresses/{addressId}")
    public ResponseEntity<AddressDTO> getAddress(@PathVariable(name = "addressId") Long addressId) {
        AddressDTO getAddressDTO = addressService.getAddress(addressId);

        return new ResponseEntity<AddressDTO>(getAddressDTO, HttpStatus.FOUND);
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(@Valid @RequestBody Address address,
            @PathVariable(name = "addressId") Long addressId) {
        AddressDTO updateAddressDTO = addressService.updateAddress(addressId, address);

        return new ResponseEntity<AddressDTO>(updateAddressDTO, HttpStatus.OK);
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<String> deleteAddress(@PathVariable(name = "addressId") Long addressId) {
        String deleteAddress = addressService.deleteAddress(addressId);

        return new ResponseEntity<String>(deleteAddress, HttpStatus.OK);
    }
}
