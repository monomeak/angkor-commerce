package com.angkor.commerce.category.impl;

import com.angkor.commerce.category.Category;
import com.angkor.commerce.category.CategoryRepository;
import com.angkor.commerce.category.CategoryService;
import com.angkor.commerce.category.dto.request.CreateCategoryRequest;
import com.angkor.commerce.category.dto.request.UpdateCategoryRequest;
import com.angkor.commerce.category.dto.response.CategoryFullResponse;
import com.angkor.commerce.common.exception.ResourceNotFoundException;
import com.angkor.commerce.common.exception.ValidationException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryFullResponse> listCategories() {
        return categoryRepository.findAllByOrderBySortOrderAscNameAsc().stream().map(CategoryFullResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryFullResponse getCategoryById(Long id) {
        return CategoryFullResponse.from(findCategoryOrThrow(id));
    }

    @Override
    @Transactional
    public CategoryFullResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new ValidationException("Slug is already in use.", Map.of("slug", "This slug is already in use."));
        }
        if (request.parentId() != null) {
            findCategoryOrThrow(request.parentId());
        }

        Integer sortOrder = request.sortOrder() != null ? request.sortOrder() : nextSortOrder(request.parentId());
        Category category = new Category();
        category.setParentId(request.parentId());
        category.setName(request.name());
        category.setSlug(request.slug());
        category.setSortOrder(sortOrder);
        return CategoryFullResponse.from(categoryRepository.save(category));
    }

    // Gap-of-10 scheme: append after the last sibling in the same parentId
    // group so ordering stays self-maintaining without the caller having to
    // compute the next value by hand.
    private int nextSortOrder(Long parentId) {
        Optional<Category> lastSibling =
            parentId != null
                ? categoryRepository.findTopByParentIdOrderBySortOrderDesc(parentId)
                : categoryRepository.findTopByParentIdIsNullOrderBySortOrderDesc();

        return lastSibling.map(sibling -> sibling.getSortOrder() + 10).orElse(0);
    }

    @Override
    @Transactional
    public CategoryFullResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = findCategoryOrThrow(id);

        if (request.slug() != null && !request.slug().equals(category.getSlug())) {
            if (categoryRepository.existsBySlugAndIdNot(request.slug(), id)) {
                throw new ValidationException(
                    "Slug is already in use.",
                    Map.of("slug", "This slug is already in use.")
                );
            }
            category.setSlug(request.slug());
        }
        if (request.parentId() != null) {
            if (request.parentId().equals(id)) {
                throw new ValidationException(
                    "A category cannot be its own parent.",
                    Map.of("parentId", "A category cannot be its own parent.")
                );
            }
            findCategoryOrThrow(request.parentId());
            category.setParentId(request.parentId());
        }
        if (request.name() != null) {
            category.setName(request.name());
        }
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }

        return CategoryFullResponse.from(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryFullResponse archiveCategory(Long id) {
        Category category = findCategoryOrThrow(id);
        CategoryFullResponse response = CategoryFullResponse.from(category);
        categoryRepository.delete(category);
        return response;
    }

    private Category findCategoryOrThrow(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Category", id));
    }
}
