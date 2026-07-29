package com.acme.invoice.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
class OpenApiConfig {

    @Bean
    OpenAPI acmeInvoiceOpenApi() {
        return new OpenAPI()
            .info(
                new Info()
                    .title("ACME Invoice Management API")
                    .description("API contract for the ACME Invoice Management System")
                    .version("v1")
            )
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
