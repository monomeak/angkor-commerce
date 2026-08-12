package com.angkor.commerce.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.format.FormatterRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Enums go out lowercase (see {@code @JsonValue} on each enum) but come back in as
 * query parameters, which Spring binds through the ConversionService rather than
 * Jackson — so {@code MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS} in
 * {@link JacksonConfig} does not apply here. Without this, a client that echoes a
 * value the API itself emitted (?status=active) gets a 400 while the UPPERCASE
 * form it never sees succeeds.
 */
@Configuration
public class WebConversionConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(@NonNull FormatterRegistry registry) {
        registry.addConverterFactory(new CaseInsensitiveEnumConverterFactory());
    }

    static class CaseInsensitiveEnumConverterFactory implements ConverterFactory<String, Enum> {

        @Override
        @NonNull
        public <T extends Enum> Converter<String, T> getConverter(@NonNull Class<T> targetType) {
            return source -> {
                String value = source.trim();
                if (value.isEmpty()) {
                    return null;
                }
                @SuppressWarnings({ "unchecked", "rawtypes" })
                T result = (T) Enum.valueOf((Class<? extends Enum>) targetType, value.toUpperCase());
                return result;
            };
        }
    }
}
