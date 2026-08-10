package com.angkor.commerce.config;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.MapperFeature;
import tools.jackson.databind.cfg.DateTimeFeature;

@Configuration
public class JacksonConfig {

    /**
     * Requests accept an enum in any casing; the lowercase wire value itself comes from @JsonValue
     * on each enum. Deliberately NOT EnumFeature.WRITE_ENUMS_TO_LOWERCASE: springdoc introspects
     * with Jackson 2 and cannot see Jackson 3 datatype features, so a feature-driven lowercase
     * would ship an OpenAPI schema advertising UPPERCASE while responses were lowercase.
     */
    @Bean
    public JsonMapperBuilderCustomizer jacksonCustomizer() {
        return builder ->
            builder.disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS).enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS);
    }
}
