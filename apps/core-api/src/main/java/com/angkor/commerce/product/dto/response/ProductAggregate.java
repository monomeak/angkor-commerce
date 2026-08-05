package com.angkor.commerce.product.dto.response;

import java.math.BigDecimal;

public interface ProductAggregate {
    Long getProductId();
    Integer getTotalStock();
    Integer getVariantCount();
    BigDecimal getMinPrice();
}
