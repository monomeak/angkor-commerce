package com.angkor.commerce.payment;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.payment.dto.request.VoidPaymentRequest;
import com.angkor.commerce.payment.dto.response.PaymentResponse;
import com.angkor.commerce.security.JwtAuthenticationFilter.AuthenticatedUser;
import com.angkor.commerce.security.annotation.IsAdmin;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.PAYMENT_BASE)
@RequiredArgsConstructor
@Validated
@Tag(name = "Payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{paymentId}/void")
    @IsAdmin
    public ResponseEntity<PaymentResponse> voidPayment(
        @AuthenticationPrincipal AuthenticatedUser staff,
        @PathVariable Long paymentId,
        @RequestBody @Valid VoidPaymentRequest request
    ) {
        return ResponseEntity.ok(paymentService.voidPayment(paymentId, request, staff.id()));
    }
}
