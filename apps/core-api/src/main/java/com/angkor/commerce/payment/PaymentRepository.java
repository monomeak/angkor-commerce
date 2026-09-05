package com.angkor.commerce.payment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceIdOrderByPaymentDateAscIdAsc(Long invoiceId);

    /**
     * Revenue is money received, so it is summed from COMPLETED payments rather than from
     * invoice totals — a voided payment stops counting the moment it is voided.
     */
    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.paymentStatus = 'COMPLETED'")
    BigDecimal sumCompletedPayments();

    /**
     * One row per month with money in it: [year, month, total]. Months with no payments are
     * absent and the service fills them in as zero, so the chart has no gaps.
     */
    @Query(
        """
        select year(p.paymentDate), month(p.paymentDate), coalesce(sum(p.amount), 0)
        from Payment p
        where p.paymentStatus = 'COMPLETED' and p.paymentDate >= :from
        group by year(p.paymentDate), month(p.paymentDate)
        order by year(p.paymentDate), month(p.paymentDate)
        """
    )
    List<Object[]> sumCompletedPaymentsByMonth(@Param("from") LocalDate from);
}
