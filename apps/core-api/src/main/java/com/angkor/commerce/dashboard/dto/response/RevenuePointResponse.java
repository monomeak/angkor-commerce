package com.angkor.commerce.dashboard.dto.response;

import java.math.BigDecimal;

/** One month of received payments. {@code month} is "YYYY-MM" so the client sorts it as a string. */
public record RevenuePointResponse(String month, BigDecimal revenue) {}
