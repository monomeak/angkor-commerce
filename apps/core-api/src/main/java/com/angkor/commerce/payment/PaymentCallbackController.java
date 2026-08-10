package com.angkor.commerce.payment;

import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.payment.checkout.CheckoutService;
import com.angkor.commerce.payment.gateway.PaymentGatewayEvent;
import com.angkor.commerce.payment.gateway.PaymentGatewayEventRepository;
import com.angkor.commerce.payment.gateway.aba.AbaPayWayGatewayAdapter;
import com.angkor.commerce.payment.gateway.aba.AbaPushback;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping(ApiConstants.API_BASE + "/payment-callbacks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment callback")
public class PaymentCallbackController {

    private final CheckoutService checkoutService;
    private final PaymentGatewayEventRepository eventRepository;
    private final ObjectMapper objectMapper;

    /**
     * PayWay POSTs here after a payment. The payload is UNSIGNED, so we
     * extract only the tran_id and let verifyAndProcess ask PayWay what
     * really happened. A forged pushback therefore triggers a check
     * that finds nothing — it cannot create an invoice.
     */

    @PostMapping("/aba")
    public ResponseEntity<String> abaPushback(@RequestBody String rawBody, HttpServletRequest request) {
        String reference = null;
        String outcome;
        String detail = null;

        try {
            AbaPushback pushback = objectMapper.readValue(rawBody, AbaPushback.class);
            reference = pushback.tranId();

            log.info("PayWay pushback for {}: claims status {}", reference, pushback.status());

            checkoutService.verifyAndProcess(reference);
            outcome = "PROCESSED";
        } catch (ResourceNotFoundException e) {
            outcome = "NOT_FOUND";
            detail = e.getMessage();
            log.warn("Pushback for unknown reference {}", reference);
        } catch (Exception e) {
            outcome = "ERROR";
            detail = e.getMessage();
            log.error("Pushback processing failed for {}", reference, e);
            // log event
            logEvent(reference, rawBody, request, outcome, detail);
            return ResponseEntity.internalServerError().body("retry");
        }

        // log event
        logEvent(reference, rawBody, request, outcome, detail);
        return ResponseEntity.ok("ok");
    }

    private void logEvent(String reference, String rawBody, HttpServletRequest request, String outcome, String detail) {
        try {
            PaymentGatewayEvent event = new PaymentGatewayEvent();
            event.setProvider(AbaPayWayGatewayAdapter.PROVIDER);
            event.setReference(reference);
            event.setRawPayload(rawBody);
            event.setRemoteIp(request.getRemoteAddr());
            event.setOutcome(outcome);
            event.setDetail(detail);

            eventRepository.save(event);
        } catch (Exception e) {
            log.error("Could not log gateway event", e);
        }
    }
}
