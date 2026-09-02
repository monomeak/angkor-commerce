package com.angkor.commerce.customer.specification;

import com.angkor.commerce.common.enums.RecordStatus;
import com.angkor.commerce.customer.Customer;
import com.angkor.commerce.customer.dto.request.CustomerQueryParams;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class CustomerSpecification {

    private CustomerSpecification() {}

    public static Specification<Customer> from(CustomerQueryParams q) {
        return Specification.where(status(q.status())).and(search(q.search()));
    }

    /**
     * Same rule as products: archived rows stay out of the default listing but must be
     * reachable when asked for by name, or a soft-deleted customer could never be reviewed.
     */
    private static Specification<Customer> status(RecordStatus status) {
        return status == null
            ? (root, cq, cb) -> cb.notEqual(root.get("status"), RecordStatus.DELETED)
            : (root, cq, cb) -> cb.equal(root.get("status"), status);
    }

    /**
     * One box over everything a staff member would type: the name as it reads on screen,
     * either half of it on its own, the email, the phone or the company.
     *
     * The full-name predicate is what the previous three-field derived query could not do —
     * "Dara Chan" matched neither firstName nor lastName and returned nothing.
     */
    private static Specification<Customer> search(String search) {
        if (!StringUtils.hasText(search)) {
            return Specification.unrestricted();
        }

        String pattern = "%" + search.toLowerCase().trim() + "%";

        return (root, cq, cb) ->
            cb.or(
                cb.like(fullName(root, cb), pattern),
                cb.like(lowerOrEmpty(root, cb, "email"), pattern),
                cb.like(lowerOrEmpty(root, cb, "phone"), pattern),
                cb.like(lowerOrEmpty(root, cb, "companyName"), pattern)
            );
    }

    /** "first last", lowercased. Both halves are nullable, and concat with a null is null. */
    private static Expression<String> fullName(Root<Customer> root, CriteriaBuilder cb) {
        return cb.lower(
            cb.concat(
                cb.concat(cb.coalesce(root.get("firstName"), ""), " "),
                cb.coalesce(root.get("lastName"), "")
            )
        );
    }

    private static Expression<String> lowerOrEmpty(Root<Customer> root, CriteriaBuilder cb, String field) {
        return cb.lower(cb.coalesce(root.get(field), ""));
    }
}
