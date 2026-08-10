package com.angkor.commerce.wallet;


import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.security.JwtAuthenticationFilter.AuthenticatedCustomer;
import com.angkor.commerce.wallet.dto.request.WalletQueryParams;
import com.angkor.commerce.wallet.dto.request.WalletResponse;
import com.angkor.commerce.wallet.dto.response.WalletTransactionResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.STOREFRONT_BASE + "/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet")

public class CustomerWalletController {


    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<WalletResponse> getWallet(@AuthenticationPrincipal AuthenticatedCustomer customer, @RequestParam(defaultValue = "USD") String currency){
        return ResponseEntity.ok(walletService.getWallet(customer.id(), currency));
    }

    @GetMapping("/transactions")
    public ResponseEntity<PageResponse<WalletTransactionResponse>> getTransactions(@AuthenticationPrincipal AuthenticatedCustomer customer, @RequestParam(defaultValue = "USD") String currency, @Valid WalletQueryParams queryParams){
        return ResponseEntity.ok(walletService.getTransactions(customer.id(), currency, queryParams));
    }



}

