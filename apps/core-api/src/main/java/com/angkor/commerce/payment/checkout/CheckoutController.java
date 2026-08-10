package com.angkor.commerce.payment.checkout;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.payment.dto.request.StartPaymentRequest;
import com.angkor.commerce.payment.dto.response.PaymentIntentResponse;
import com.angkor.commerce.payment.dto.response.PaymentStatusResponse;
import com.angkor.commerce.payment.gateway.PaymentGatewayResolver;
import com.angkor.commerce.security.JwtAuthenticationFilter.AuthenticatedCustomer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiConstants.STOREFRONT_BASE + "/checkout")
@Validated
@Tag(name = "Checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final PaymentGatewayResolver gatewayResolver;

    // post to pay

    @PostMapping("/orders/{orderId}/pay")
    @Operation(summary = "Start paymet  - return the QR to display")
    public ResponseEntity<PaymentIntentResponse> startPayment(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @PathVariable Long orderId,
        @RequestBody(required = false) @Valid StartPaymentRequest request
    ) {
        PaymentIntentResponse response = checkoutService.startPayment(
            customer.id(),
            orderId,
            request != null ? request.provider() : null
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment/{reference}")
    @Operation(summary = "Poll payment status while the QR is on screen")
    public ResponseEntity<PaymentStatusResponse> getStatus(
        @AuthenticationPrincipal AuthenticatedCustomer customer,
        @PathVariable String reference
    ) {
        return ResponseEntity.ok(checkoutService.getPaymentStatus(customer.id(), reference));
    }

    @GetMapping("/payment-methods")
    @Operation(summary = "Which providers can the frontend offer")
    public ResponseEntity<Set<String>> paymentMethods() {
        return ResponseEntity.ok(gatewayResolver.available());
    }

    @PostMapping("/payments/{reference}/wallet-confirm")
    @Operation(summary = "Pay a wallet intent from the customer's balance")
    public ResponseEntity<PaymentStatusResponse> confirmWalletPayment(
            @AuthenticationPrincipal  AuthenticatedCustomer customer, @PathVariable String reference
    ){
        return  ResponseEntity.ok(checkoutService.confirmWalletPayment(customer.id(), reference));
    }
}
