package com.angkor.commerce.category;

import com.angkor.commerce.category.dto.request.CreateCategoryRequest;
import com.angkor.commerce.category.dto.request.UpdateCategoryRequest;
import com.angkor.commerce.category.dto.response.CategoryFullResponse;
import java.util.List;

public interface CategoryService {
    List<CategoryFullResponse> listCategories();

    CategoryFullResponse getCategoryById(Long id);

    CategoryFullResponse createCategory(CreateCategoryRequest request);

    CategoryFullResponse updateCategory(Long id, UpdateCategoryRequest request);

    CategoryFullResponse archiveCategory(Long id);

    /**
     * The given category plus every category beneath it, depth-first.
     *
     * <p>Products only ever hang off leaf categories, so filtering a listing by a parent
     * ("men") has to match the whole subtree or it returns nothing. Callers pass the result
     * to {@code ProductSpecification.from(query, categoryIds)}.
     *
     * <p>Returns a singleton list for a leaf, and for an id that does not exist — the caller
     * gets an id that simply matches no products, rather than an exception on a filter.
     */
    List<Long> getDescendantCategoryIds(Long categoryId);
}
