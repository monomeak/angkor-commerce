package com.angkor.commerce.payment.gateway.aba;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;

import com.angkor.commerce.common.exception.PaymentGatewayException;

@Component
public class AbaHashBuilder {

    /**
     * hash = Base64( HMAC-SHA512( join(values), apiKey ) )
     *
     * The caller supplies the values ALREADY in PayWay's hash order.
     * Nulls become empty strings but keep their position.
     */

    public String hash(List<String> orderedValues, String apiKey) {
        String payload = orderedValues
            .stream()
            .map(v -> v == null ? "" : v)
            .collect(Collectors.joining());

        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(apiKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            return Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new PaymentGatewayException("Cannot compute PayWay hash", e);
        }
    }
}
