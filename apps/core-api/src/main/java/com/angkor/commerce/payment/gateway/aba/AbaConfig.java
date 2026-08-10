package com.angkor.commerce.payment.gateway.aba;

import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(AbaPayWayProperties.class)
public class AbaConfig {

    @Bean
    RestClient abaRestClient(RestClient.Builder builder, AbaPayWayProperties props) {
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(
            HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()
        );
        factory.setReadTimeout(Duration.ofSeconds(15));
        return builder.baseUrl(props.baseUrl()).requestFactory(factory).build();
    }
}
