import type {
    ProductDto,
    ProductListDto,
    ProductSummaryDto,
    ProductVariantDto
} from "../schemas/product-api.schema";
import type { Product, ProductListResult, ProductSummary, ProductVariant } from "../types/product";

/**
 * core-api leaves a surprising number of numeric fields nullable — a product with no
 * variants has no aggregate row, so totalStock/variantCount come back null. The grids count
 * and format these, so they are normalised once here rather than guarded at every call site.
 */
const DEFAULT_CURRENCY = "USD";

export function mapProductSummary(dto: ProductSummaryDto): ProductSummary {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        categoryName: dto.category,
        categoryId: dto.categoryId,
        categorySlug: dto.categorySlug,
        price: dto.price ?? 0,
        currency: dto.currency ?? DEFAULT_CURRENCY,
        discountPercentage: dto.discountPercentage ?? 0,
        rating: dto.rating ?? 0,
        totalStock: dto.totalStock ?? 0,
        variantCount: dto.variantCount ?? 0,
        thumbnail: dto.thumbnail
    };
}

export function mapProductList(dto: ProductListDto): ProductListResult {
    return {
        products: dto.products.map(mapProductSummary),
        total: dto.total,
        skip: dto.skip,
        limit: dto.limit
    };
}

export function mapProductVariant(dto: ProductVariantDto): ProductVariant {
    return {
        id: dto.id,
        size: dto.size,
        sku: dto.sku,
        stock: dto.stock,
        price: dto.price,
        priceOverride: dto.priceOverride
    };
}

export function mapProduct(dto: ProductDto): Product {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        price: dto.price,
        currency: dto.currency ?? DEFAULT_CURRENCY,
        discountPercentage: dto.discountPercentage ?? 0,
        rating: dto.rating ?? 0,
        unit: dto.unit,
        thumbnailUrl: dto.thumbnailUrl,
        // The API does not promise an order, and the gallery reads positionally.
        images: [...dto.images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
        variants: dto.variants.map(mapProductVariant),
        totalStock: dto.totalStock ?? 0
    };
}
