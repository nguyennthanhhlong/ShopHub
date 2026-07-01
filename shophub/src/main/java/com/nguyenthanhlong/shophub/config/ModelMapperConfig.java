package com.nguyenthanhlong.shophub.config;

import com.nguyenthanhlong.shophub.entity.Product;
import com.nguyenthanhlong.shophub.payloads.ProductDTO;
import org.modelmapper.Condition;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
