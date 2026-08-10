package com.angkor.commerce.payment.gateway;

public enum GatewayStatus {
    PENDING, // PayWay says: not paid yet
    SUCCEEDED, // PayWay says: APPROVED
    FAILED, // PayWay says: DECLINED / CANCELLED
    UNKNOWN // could not reach PayWay, or unrecognised answer — try later
}
