package com.nguyenthanhlong.shophub.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nguyenthanhlong.shophub.entity.Address;
import com.nguyenthanhlong.shophub.entity.User;
import com.nguyenthanhlong.shophub.exceptions.APIException;
import com.nguyenthanhlong.shophub.exceptions.ResourceNofFoundException;
import com.nguyenthanhlong.shophub.payloads.AddressDTO;
import com.nguyenthanhlong.shophub.repository.AddressRepo;
import com.nguyenthanhlong.shophub.repository.UserRepo;
import com.nguyenthanhlong.shophub.service.AddressService;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class AddressServiceImp implements AddressService {

    private final AddressRepo addressRepo;

    private final UserRepo userRepo;

    private final ModelMapper modelMapper;

    public AddressServiceImp(AddressRepo addressRepo, UserRepo userRepo, ModelMapper modelMapper) {
        this.addressRepo = addressRepo;
        this.userRepo = userRepo;
        this.modelMapper = modelMapper;
    }

    @Override
    public AddressDTO createAddress(AddressDTO addressDTO) {
        String country = addressDTO.getCountry();
        String state = addressDTO.getState();
        String city = addressDTO.getCity();
        String pincode = addressDTO.getPincode();
        String street = addressDTO.getStreet();
        String buildingName = addressDTO.getBuildingName();

        Address addressFromDB = addressRepo
                .findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(country, state,
                        city, pincode, street, buildingName);

        if (addressFromDB != null) {
            throw new APIException("Address already exits with addressId: " + addressFromDB.getAddressId());
        }

        Address addresses = modelMapper.map(addressDTO, Address.class);

        Address saveAddress = addressRepo.save(addresses);

        return modelMapper.map(saveAddress, AddressDTO.class);

    }

    @Override
    public String deleteAddress(Long addressId) {
        Address addressesFromDB = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNofFoundException("Address", "addressID", addressId));

        List<User> users = userRepo.findByAddress(addressId);

        users.forEach(user -> {
            user.getAddresses().remove(addressesFromDB);
            userRepo.save(user);
        });

        addressRepo.deleteById(addressId);

        return "Address deleted successfully with addressId: " + addressId;
    }

    @Override
    public AddressDTO getAddress(Long addressId) {
        Address address = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNofFoundException("Address", "addressId", addressId));

        return modelMapper.map(address, AddressDTO.class);

    }

    @Override
    public List<AddressDTO> getAddresses() {
        List<Address> addresses = addressRepo.findAll();

        List<AddressDTO> addressDTOs = addresses.stream().map(address -> modelMapper.map(address, AddressDTO.class))
                .collect(Collectors.toList());

        return addressDTOs;
    }

    @Override
    public AddressDTO updateAddress(Long addressId, Address addresses) {
        Address addressFromDB = addressRepo
                .findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
                        addresses.getCountry(), addresses.getState(), addresses.getCity(), addresses.getPincode(),
                        addresses.getPincode(), addresses.getBuildingName());

        if (addressFromDB == null) {
            addressFromDB = addressRepo.findById(addressId)
                    .orElseThrow(() -> new ResourceNofFoundException("Address", "addressId", addressId));

            addressFromDB.setCountry(addresses.getCountry());
            addressFromDB.setState(addresses.getState());
            addressFromDB.setCity(addresses.getCity());
            addressFromDB.setPincode(addresses.getPincode());
            addressFromDB.setStreet(addresses.getStreet());
            addressFromDB.setBuildingName(addresses.getBuildingName());

            Address updateAddress = addressRepo.save(addressFromDB);
            return modelMapper.map(updateAddress, AddressDTO.class);
        } else {
            List<User> users = userRepo.findByAddress(addressId);
            final Address a = addressFromDB;

            users.forEach(user -> user.getAddresses().add(a));

            deleteAddress(addressId);

            return modelMapper.map(addressFromDB, AddressDTO.class);
        }
    }

}
