package com.angkor.commerce.payment.gateway;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentGatewayEventRepository extends JpaRepository<PaymentGatewayEvent, Long> {}
