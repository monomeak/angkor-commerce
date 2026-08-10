package com.angkor.commerce.wallet.dev;

import static java.util.Objects.requireNonNullElse;

import com.angkor.commerce.wallet.WalletService;
import com.angkor.commerce.wallet.WalletTxnType;
import com.angkor.commerce.wallet.dto.request.WalletSeedRequest;
import com.angkor.commerce.wallet.dto.response.WalletTransactionResponse;
import com.angkor.commerce.wallet.mapper.WalletMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// wallet/dev/WalletSeedController.java
@RestController
@RequestMapping("/api/v1/dev/wallet")
@RequiredArgsConstructor
@Profile("!prod")
@ConditionalOnProperty(name = "angkor.wallet.seed.enabled", havingValue = "true")
@Slf4j
@Tag(name = "Wallet Seeding")
public class WalletSeedController {

    private static final String DEFAULT_CURRENCY = "USD";

    private final WalletService walletService;
    private final WalletMapper walletMapper;

    @PostMapping("/seed")
    @Operation(summary = "DEV ONLY — give a customer a demo balance")
    public ResponseEntity<WalletTransactionResponse> seed(@Valid @RequestBody WalletSeedRequest request) {
        log.warn(
            "DEV SEED: crediting {} {} to customer {}",
            request.amount(),
            request.currency(),
            request.customerId()
        );

        return ResponseEntity.ok(
            walletMapper.toResponse(
                walletService.credit(
                    request.customerId(),
                    requireNonNullElse(request.currency(), DEFAULT_CURRENCY),
                    request.amount(),
                    WalletTxnType.SEED,
                    null,
                    "Development seed",
                    null
                )
            )
        );
    }
}
