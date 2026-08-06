package com.angkor.commerce.category;

import com.angkor.commerce.category.dto.request.CreateCategoryRequest;
import com.angkor.commerce.category.dto.request.UpdateCategoryRequest;
import com.angkor.commerce.category.dto.response.CategoryFullResponse;
import com.angkor.commerce.common.ApiConstants;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.CATEGORIES_BASE)
@Tag(name = "Category Module")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Public catalog read — shared by back-office and storefront, see
    // docs/CORE_API_ENDPOINTS.md. Returns a flat active list; callers build
    // the parent/child tree client-side (same as the mock category-helpers.ts
    // in apps/customer-portal does today).

    @GetMapping
    public List<CategoryFullResponse> list() {
        return categoryService.listCategories();
    }

    @GetMapping("/{id}")
    public CategoryFullResponse get(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryFullResponse create(@RequestBody @Valid CreateCategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/{id}")
    public CategoryFullResponse update(@PathVariable Long id, @RequestBody @Valid UpdateCategoryRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    public CategoryFullResponse archive(@PathVariable Long id) {
        return categoryService.archiveCategory(id);
    }
}
