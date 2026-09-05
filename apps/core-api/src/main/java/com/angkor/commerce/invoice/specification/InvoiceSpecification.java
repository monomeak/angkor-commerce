package com.angkor.commerce.invoice.specification;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.invoice.Invoice;
import com.angkor.commerce.invoice.InvoiceStatus;
import com.angkor.commerce.invoice.dto.request.InvoiceQueryParams;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.From;
import java.time.LocalDate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

/**
 * Filtering for the invoice lists, back office and storefront alike — the storefront simply
 * passes its own customer id, so a customer can never widen the query past their own rows.
 */
public final class InvoiceSpecification {

    private InvoiceSpecification() {}

    /** @param customerId forced by the storefront to the session's customer; null in the back office. */
    public static Specification<Invoice> from(InvoiceQueryParams q, Long customerId) {
        Long owner = customerId != null ? customerId : q.customerId();

        return Specification
            .where(notDeleted())
            .and(fetchCustomer())
            .and(invoiceStatus(q.status()))
            .and(customer(owner))
            .and(search(q.search()))
            .and(dateBetween("issueDate", q.issueDateFrom(), q.issueDateTo()))
            .and(dateBetween("dueDate", q.dueDateFrom(), q.dueDateTo()));
    }

    /** A soft-deleted invoice is gone as far as every list is concerned. */
    private static Specification<Invoice> notDeleted() {
        return (root, cq, cb) -> cb.notEqual(root.get("status"), RecordStatus.DELETED);
    }

    /**
     * The list renders the customer's name on every row, so it is fetched with the page
     * rather than one query per row. Skipped for the count query, which selects a Long and
     * would fail on a fetch join.
     */
    private static Specification<Invoice> fetchCustomer() {
        return (root, cq, cb) -> {
            if (cq != null && Long.class != cq.getResultType()) {
                root.fetch("customer", JoinType.LEFT);
            }
            return null;
        };
    }

    private static Specification<Invoice> invoiceStatus(InvoiceStatus status) {
        return status == null
            ? Specification.unrestricted()
            : (root, cq, cb) -> cb.equal(root.get("invoiceStatus"), status);
    }

    private static Specification<Invoice> customer(Long customerId) {
        return customerId == null
            ? Specification.unrestricted()
            : (root, cq, cb) -> cb.equal(root.get("customer").get("id"), customerId);
    }

    /**
     * One box over the two things staff look an invoice up by: its number, and whoever it was
     * issued to. The customer half joins rather than fetches — fetchCustomer() already brought
     * the association in, and a second fetch would duplicate rows.
     */
    private static Specification<Invoice> search(String search) {
        if (!StringUtils.hasText(search)) {
            return Specification.unrestricted();
        }

        String pattern = "%" + search.toLowerCase().trim() + "%";

        return (root, cq, cb) -> {
            var customer = root.join("customer", JoinType.LEFT);

            return cb.or(
                cb.like(cb.lower(root.get("invoiceNumber")), pattern),
                cb.like(fullName(customer, cb), pattern),
                cb.like(lowerOrEmpty(customer, cb, "companyName"), pattern),
                cb.like(lowerOrEmpty(customer, cb, "email"), pattern)
            );
        };
    }

    /** Inclusive on both ends: a staff member picking 1–31 March means the whole month. */
    private static Specification<Invoice> dateBetween(String field, LocalDate from, LocalDate to) {
        if (from == null && to == null) {
            return Specification.unrestricted();
        }

        return (root, cq, cb) -> {
            if (from != null && to != null) {
                return cb.between(root.get(field), from, to);
            }
            return from != null
                ? cb.greaterThanOrEqualTo(root.get(field), from)
                : cb.lessThanOrEqualTo(root.get(field), to);
        };
    }

    private static Expression<String> fullName(From<?, ?> customer, CriteriaBuilder cb) {
        return cb.lower(
            cb.concat(
                cb.concat(cb.coalesce(customer.get("firstName"), ""), " "),
                cb.coalesce(customer.get("lastName"), "")
            )
        );
    }

    private static Expression<String> lowerOrEmpty(From<?, ?> from, CriteriaBuilder cb, String field) {
        return cb.lower(cb.coalesce(from.get(field), ""));
    }
}
