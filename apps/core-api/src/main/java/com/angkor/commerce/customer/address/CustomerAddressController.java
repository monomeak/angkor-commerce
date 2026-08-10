package com.angkor.commerce.customer.address;


import com.angkor.commerce.common.ApiConstants;
import com.angkor.commerce.customer.address.dto.request.CreateAddressRequest;
import com.angkor.commerce.customer.address.dto.request.UpdateAddressRequest;
import com.angkor.commerce.customer.address.dto.response.AddressResponse;
import com.angkor.commerce.security.JwtAuthenticationFilter.AuthenticatedCustomer;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.STOREFRONT_ADDRESSES)
@RequiredArgsConstructor
@Tag(name = "Customer Addresses")
public class CustomerAddressController {

    private final CustomerAddressService customerAddressService;
    @GetMapping()
     public ResponseEntity<List<AddressResponse>> getAllAdresses(@AuthenticationPrincipal AuthenticatedCustomer customer){
        return ResponseEntity.ok(customerAddressService.getAllByCustomerId(customer.id()));
    }
    @GetMapping("/{addressId}")
    public ResponseEntity<AddressResponse> getAddress(  @AuthenticationPrincipal AuthenticatedCustomer customer ,@PathVariable("addressId") Long addressId){
        return ResponseEntity.ok(customerAddressService.getByIdAndCustomerId(addressId, customer.id()));
    }

    @PostMapping()
    public  ResponseEntity<AddressResponse> createAddress(@AuthenticationPrincipal AuthenticatedCustomer customer,
                                                          @RequestBody @Valid CreateAddressRequest request){
        return ResponseEntity.ok(customerAddressService.createAddress(customer.id(), request));

    }

    @PatchMapping("/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(   @AuthenticationPrincipal AuthenticatedCustomer customer,
                                                            @PathVariable Long addressId,
                                                            @RequestBody @Valid UpdateAddressRequest request){
        return  ResponseEntity.ok(customerAddressService.updateAddress(customer.id(), addressId, request));

    }

    @PutMapping("/{addressId}/default")
    public ResponseEntity<AddressResponse> setDefault(@AuthenticationPrincipal AuthenticatedCustomer customer,
                                                      @PathVariable Long addressId){

        return ResponseEntity.ok(customerAddressService.setDefaultAddress(customer.id(), addressId));
    }

    @DeleteMapping("/{addressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress( @AuthenticationPrincipal AuthenticatedCustomer customer ,@PathVariable Long addressId){
        customerAddressService.deleteAddress(customer.id(), addressId);
    }





}
