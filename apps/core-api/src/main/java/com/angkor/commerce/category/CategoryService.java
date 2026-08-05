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
}
