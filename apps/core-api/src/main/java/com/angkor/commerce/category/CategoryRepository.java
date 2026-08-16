package com.angkor.commerce.category;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderBySortOrderAscNameAsc();

    // Used to auto-append a new category to the end of its sibling group
    // (gap-of-10 sortOrder scheme) when the caller doesn't specify one.
    Optional<Category> findTopByParentIdOrderBySortOrderDesc(Long parentId);

    Optional<Category> findTopByParentIdIsNullOrderBySortOrderDesc();

    // Storefront URLs carry the slug, not the id, so listing filters resolve through here.
    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
