package com.angkor.commerce.product;

import org.springframework.web.multipart.MultipartFile;

import com.angkor.commerce.common.dto.PageResponse;
import com.angkor.commerce.product.dto.request.CreateProductRequest;
import com.angkor.commerce.product.dto.request.CreateProductVariantRequest;
import com.angkor.commerce.product.dto.request.ProductQueryParams;
import com.angkor.commerce.product.dto.request.UpdateProductRequest;
import com.angkor.commerce.product.dto.request.UpdateProductVariantRequest;
import com.angkor.commerce.product.dto.response.ProductDeleteResponse;
import com.angkor.commerce.product.dto.response.ProductImageResponse;
import com.angkor.commerce.product.dto.response.ProductResponse;
import com.angkor.commerce.product.dto.response.ProductSummaryResponse;
import com.angkor.commerce.product.dto.response.ProductVariantResponse;

public interface ProductService {
    // Queries - CRUD
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    ProductDeleteResponse deleteProduct(Long id);
    ProductResponse getProductById(Long id);
    PageResponse<ProductSummaryResponse> getProducts(ProductQueryParams query);

    // Variant - Sub Resource
    ProductVariantResponse addVariant(Long productId, CreateProductVariantRequest request);
    ProductVariantResponse updateVariant(Long productId, Long variantId, UpdateProductVariantRequest request);
    void deleteVariant(Long productId, Long variantId);

    // Product image - Sub Resource
    ProductImageResponse addImage(Long productId, MultipartFile file, Integer displayOrder);
    void deleteImage(Long productId, Long imageId);
}
