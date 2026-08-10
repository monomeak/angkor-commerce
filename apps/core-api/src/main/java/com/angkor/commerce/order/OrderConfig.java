package com.angkor.commerce.order;

import com.angkor.commerce.common.util.DocumentNumberGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OrderConfig {

    /** Bean name matters: two DocumentNumberGenerators exist, so injection resolves by name. */
    @Bean
    DocumentNumberGenerator orderNumberGenerator(OrderRepository repository) {
        return new DocumentNumberGenerator("ORD", repository::nextOrderSequence);
    }
}
