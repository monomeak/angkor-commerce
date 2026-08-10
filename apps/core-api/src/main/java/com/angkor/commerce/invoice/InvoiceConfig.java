package com.angkor.commerce.invoice;

import com.angkor.commerce.common.util.DocumentNumberGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class InvoiceConfig {

    /** Bean name matters: two DocumentNumberGenerators exist, so injection resolves by name. */
    @Bean
    DocumentNumberGenerator invoiceNumberGenerator(InvoiceRepository repository) {
        return new DocumentNumberGenerator("INV", repository::nextInvoiceSequence);
    }
}
