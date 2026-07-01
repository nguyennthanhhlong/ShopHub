package com.nguyenthanhlong.shophub.service;

import java.util.List;

import com.nguyenthanhlong.shophub.entity.Address;
import com.nguyenthanhlong.shophub.payloads.AddressDTO;

public interface AddressService {
    AddressDTO createAddress(AddressDTO addressDTO);

    List<AddressDTO> getAddresses();

    AddressDTO getAddress(Long addressId);

    AddressDTO updateAddress(Long addressId, Address address);

    String deleteAddress(Long addressId);
}
