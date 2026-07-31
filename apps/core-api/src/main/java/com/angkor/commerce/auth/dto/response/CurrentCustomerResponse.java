package com.angkor.commerce.auth.dto.response;

import com.angkor.commerce.common.enums.RecordStatus;

public record CurrentCustomerResponse(
    Long id,
    String displayName,
    String firstName,
    String lastName,
    String companyName,
    String email,
    String phone,
    RecordStatus recordStatus
) {}
