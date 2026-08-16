import type {
    ProductDeleteDto,
    ProductDto,
    ProductListDto,
    ProductSummaryDto,
    ProductVariantDto
} from "../schemas/product-api.schema";
import type { ArchivedProduct, Product, ProductListResult, ProductSummary, ProductVariant } from "../types/product";

/**
 * core-api leaves a surprising number of numeric fields nullable (a product with no variants
 * has no aggregate row, so totalStock/variantCount come back null). The UI counts and sums
 * these, so they are normalised to 0 here rather than guarded at every call site.
 */
const DEFAULT_CURRENCY = "USD";

export function mapProductSummary(dto: ProductSummaryDto): ProductSummary {
    return {
        id: dto.id,
        name: dto.name,
        categoryName: dto.category,
        price: dto.price ?? 0,
        currency: dto.currency ?? DEFAULT_CURRENCY,
        discountPercentage: dto.discountPercentage ?? 0,
        rating: dto.rating ?? 0,
        totalStock: dto.totalStock ?? 0,
        variantCount: dto.variantCount ?? 0,
        thumbnail: dto.thumbnail,
        status: dto.status
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
        status: dto.status,
        thumbnailUrl: dto.thumbnailUrl,
        images: dto.images,
        variants: dto.variants.map(mapProductVariant),
        totalStock: dto.totalStock ?? 0,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt
    };
}

export function mapArchivedProduct(dto: ProductDeleteDto): ArchivedProduct {
    return {
        id: dto.id,
        name: dto.name,
        status: dto.status,
        isDeleted: dto.isDeleted,
        deletedOn: dto.deletedOn
    };
}
