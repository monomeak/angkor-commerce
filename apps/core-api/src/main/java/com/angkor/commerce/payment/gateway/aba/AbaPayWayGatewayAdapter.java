package com.angkor.commerce.payment.gateway.aba;

import com.angkor.commerce.common.exception.PaymentGatewayException;
import com.angkor.commerce.payment.PaymentMethod;
import com.angkor.commerce.payment.gateway.GatewayIntent;
import com.angkor.commerce.payment.gateway.GatewayIntentRequest;
import com.angkor.commerce.payment.gateway.GatewayStatus;
import com.angkor.commerce.payment.gateway.GatewayStatusResult;
import com.angkor.commerce.payment.gateway.PaymentGatewayPort;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
@Slf4j
public class AbaPayWayGatewayAdapter implements PaymentGatewayPort {

    public static final String PROVIDER = "ABA_PAYWAY";

    private static final DateTimeFormatter REQ_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").withZone(
        ZoneOffset.UTC
    );

    private final AbaPayWayProperties properties;
    private final AbaHashBuilder hashBuilder;
    private final RestClient abaRestClient;
    private final ObjectMapper objectMapper;

    @Override
    public String providerCode() {
        return PROVIDER;
    }

    // ══════════════════════════════════════════════════════
    // Create a QR
    // ══════════════════════════════════════════════════════

    @Override
    public GatewayIntent createIntent(GatewayIntentRequest request) {
        if (request.reference().length() > 20) {
            // Should be impossible (column is VARCHAR(20)) — belt and braces
            throw new PaymentGatewayException(
                "Reference exceeds PayWay's 20-char tran_id limit: " + request.reference()
            );
        }

        AbaQrRequest qr = new AbaQrRequest(
            REQ_TIME.format(Instant.now()),
            properties.merchantId(),
            request.reference(),
            formatAmount(request.amount(), request.currency()),
            encodeItems(request.description()),
            firstNameOf(request.customerName()),
            lastNameOf(request.customerName()),
            "", // email
            nullToEmpty(request.customerPhone()),
            "purchase",
            properties.paymentOption(),
            base64(properties.callbackUrl()),
            "", // return_deeplink
            request.currency(),
            "", // custom_fields
            "", // return_params
            "", // payout
            String.valueOf(properties.lifetimeMinutes()),
            "" // qr_image_template
        );

        String hash = hashBuilder.hash(qr.hashOrder(), properties.apiKey());

        try {
            AbaQrResponse response = abaRestClient
                .post()
                // ▼ VERIFY this path against your integration pack
                .uri("/api/payment-gateway/v1/payments/generate-qr")
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody(qr, hash))
                .retrieve()
                .body(AbaQrResponse.class);

            if (response == null || !"00".equals(response.status().code())) {
                throw new PaymentGatewayException(
                    "PayWay rejected the QR request: " +
                        (response == null ? "empty response" : response.status().message())
                );
            }

            return new GatewayIntent(
                response.data().qrString(),
                response.data().abapayDeeplink(),
                Instant.now().plus(Duration.ofMinutes(properties.lifetimeMinutes()))
            );
        } catch (RestClientException e) {
            throw new PaymentGatewayException("Could not reach PayWay", e);
        }
    }

    /**
     * PayWay's amount format depends on currency: two decimals for USD
     * ("27.50"), whole numbers for KHR ("5000"). "5000.0000" for KHR
     * is rejected.
     */
    private String formatAmount(BigDecimal amount, String currency) {
        return "KHR".equalsIgnoreCase(currency)
            ? amount.setScale(0, RoundingMode.HALF_UP).toPlainString()
            : amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String encodeItems(String description) {
        try {
            return base64(objectMapper.writeValueAsString(List.of(Map.of("name", description, "quantity", "1"))));
        } catch (JacksonException e) {
            // Jackson 3 throws unchecked; wrapped so the caller sees one gateway failure type
            throw new PaymentGatewayException("Could not encode items", e);
        }
    }

    private Map<String, String> requestBody(AbaQrRequest qr, String hash) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("req_time", qr.reqTime());
        body.put("merchant_id", qr.merchantId());
        body.put("tran_id", qr.tranId());
        body.put("amount", qr.amount());
        body.put("items", qr.items());
        body.put("first_name", qr.firstName());
        body.put("last_name", qr.lastName());
        body.put("email", qr.email());
        body.put("phone", qr.phone());
        body.put("purchase_type", qr.purchaseType());
        body.put("payment_option", qr.paymentOption());
        body.put("callback_url", qr.callbackUrl());
        body.put("currency", qr.currency());
        body.put("lifetime", qr.lifetime());
        body.put("hash", hash);
        return body;
    }

    private String base64(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private String firstNameOf(String full) {
        if (full == null || full.isBlank()) return "";
        int space = full.indexOf(' ');
        return space < 0 ? full : full.substring(0, space);
    }

    private String lastNameOf(String full) {
        if (full == null || full.isBlank()) return "";
        int space = full.indexOf(' ');
        return space < 0 ? "" : full.substring(space + 1);
    }

    // ══════════════════════════════════════════════════════
    // Check status — the only thing we trust
    // ══════════════════════════════════════════════════════
    @Override
    public GatewayStatusResult checkStatus(String reference) {
        String reqTime = REQ_TIME.format(Instant.now());
        // ▼ VERIFY the check-transaction hash order in your pack.
        //   Commonly: req_time + merchant_id + tran_id

        String hash = hashBuilder.hash(List.of(reqTime, properties.merchantId(), reference), properties.apiKey());

        try {
            AbaCheckResponse response = abaRestClient
                .post()
                // ▼ VERIFY: check-transaction vs check-transaction-2
                .uri("/api/payment-gateway/v1/payments/check-transaction-2")
                .contentType(MediaType.APPLICATION_JSON)
                .body(
                    Map.of(
                        "req_time",
                        reqTime,
                        "merchant_id",
                        properties.merchantId(),
                        "tran_id",
                        reference,
                        "hash",
                        hash
                    )
                )
                .retrieve()
                .body(AbaCheckResponse.class);

            if (response == null || !"00".equals(response.status().code())) {
                log.warn(
                    "check-transaction for {} returned {}",
                    reference,
                    response == null ? "null" : response.status().code()
                );
                return GatewayStatusResult.unknown();
            }

            AbaCheckResponse.AbaCheckData data = response.data();

            GatewayStatus status = switch (data.paymentStatus().toUpperCase()) {
                case "APPROVED" -> GatewayStatus.SUCCEEDED;
                case "DECLINED", "CANCELLED" -> GatewayStatus.FAILED;
                case "PENDING" -> GatewayStatus.PENDING;
                default -> GatewayStatus.UNKNOWN;
            };

            return new GatewayStatusResult(
                status,
                data.paymentAmount() == null ? null : new BigDecimal(data.paymentAmount()),
                data.paymentCurrency(),
                data.apv()
            );
        } catch (RestClientException e) {
            log.warn("check-transaction failed for {}: {}", reference, e.getMessage());
            return GatewayStatusResult.unknown(); // never throw — retry later
        }
    }

    @Override
    public PaymentMethod paymentMethod(){
        return PaymentMethod.QR_CODE;
    }
}
