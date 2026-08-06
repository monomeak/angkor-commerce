package com.angkor.commerce.order.dto.response;

public record ShippingDetailsResponse(
    String fullName,
    String phone,
    String address,
    String city,
    String postalCode,
    String notes
) {}
