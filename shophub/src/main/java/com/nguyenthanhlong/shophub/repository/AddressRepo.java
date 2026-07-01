package com.nguyenthanhlong.shophub.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nguyenthanhlong.shophub.entity.Address;

public interface AddressRepo extends JpaRepository<Address, Long> {

    Address findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(String country,
            String state, String city,
            String pincode, String street, String buildingName);
}
