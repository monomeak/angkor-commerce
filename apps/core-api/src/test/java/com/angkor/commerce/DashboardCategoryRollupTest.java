package com.angkor.commerce;

import static org.assertj.core.api.Assertions.assertThat;

import com.angkor.commerce.dashboard.DashboardService;
import com.angkor.commerce.dashboard.dto.response.CategorySalesResponse;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * Guards the category roll-up, whose JPQL joins two unrelated entities and resolves a root
 * through {@code coalesce(parentId, id)} — the kind of query that compiles and then fails
 * when Hibernate comes to build the SQL.
 */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("dev") // the default profile has no JWT secret, so the context cannot start on it
class DashboardCategoryRollupTest {

    @Autowired
    DashboardService dashboardService;

    @Test
    void everySeededRootCategoryIsListed() {
        List<CategorySalesResponse> sales = dashboardService.getOverview(6).salesByCategory();

        assertThat(sales)
            .extracting(CategorySalesResponse::category)
            .containsExactlyInAnyOrder("Men", "Women", "Children");
        assertThat(sales).allSatisfy(entry -> {
            assertThat(entry.unitsSold()).isZero();
            assertThat(entry.amount()).isEqualByComparingTo(BigDecimal.ZERO);
        });
    }
}
