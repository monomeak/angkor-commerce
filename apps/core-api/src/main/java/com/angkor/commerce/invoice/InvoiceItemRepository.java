package com.angkor.commerce.invoice;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    /**
     * [rootCategoryId, name, slug, units, amount] for what has actually been sold.
     *
     * Only PAID invoices count: an issued invoice is an intention, not a sale, and the rest of
     * the dashboard already measures money by what was received. Lines whose {@code productId}
     * is null — manual lines, and products deleted since — drop out of the join, because there
     * is no category to attribute them to.
     */
    @Query(
        """
        select root.id, root.name, root.slug, sum(ii.quantity), sum(ii.discountedTotal)
        from InvoiceItem ii
          join Product p on p.id = ii.productId
          join p.category leaf
          join Category root on root.id = coalesce(leaf.parentId, leaf.id)
        where ii.invoice.invoiceStatus = com.angkor.commerce.invoice.InvoiceStatus.PAID
          and ii.invoice.status <> com.angkor.commerce.common.enums.RecordStatus.DELETED
        group by root.id, root.name, root.slug
        """
    )
    List<Object[]> sumSoldUnitsByRootCategory();
}
