package com.angkor.commerce.payment.gateway.aba;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * What PayWay POSTs to our callback URL. Note what is MISSING: no
 * amount, no signature. This is why we never trust it.
 */
public record AbaPushback(
    @JsonProperty("tran_id") String tranId,
    @JsonProperty("apv") String apv,
    @JsonProperty("status") String status,
    @JsonProperty("merchant_ref_no") String merchantRefNo
) {}
