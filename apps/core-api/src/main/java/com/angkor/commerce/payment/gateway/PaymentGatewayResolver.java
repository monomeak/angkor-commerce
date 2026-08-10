package com.angkor.commerce.payment.gateway;

import com.angkor.commerce.common.exception.ValidationException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PaymentGatewayResolver {

    private final Map<String, PaymentGatewayPort> gateways;

    public PaymentGatewayResolver(List<PaymentGatewayPort> ports) {
        this.gateways = ports.stream().collect(Collectors.toMap(PaymentGatewayPort::providerCode, Function.identity()));
    }

    public PaymentGatewayPort resolve(String providerCode) {
        PaymentGatewayPort gateway = gateways.get(providerCode.toUpperCase());
        if (gateway == null) {
            throw new ValidationException("Unknown payment provider: " + providerCode);
        }
        return gateway;
    }

    public Set<String> available() {
        return gateways.keySet();
    }
}
