package com.angkor.commerce.common;

public final class ApiConstants {

    private ApiConstants() {}

    // API Base
    public static final String API_BASE = "/api/v1";
    public static final String STOREFRONT_BASE = API_BASE + "/storefront";

    // Back office
    public static final String AUTH_BASE = API_BASE + "/auth";
    public static final String ORDER_BASE = API_BASE + "/orders";
    public static final String INVOICES_BASE = API_BASE + "/invoices";
    public static final String USERS_BASE = API_BASE + "/users";
    public static final String CUSTOMER_BASE = API_BASE + "/customers";
    public static final String PRODUCES_BASE = API_BASE + "/products";
    public static final String PATH_ID = "/{id}";
    public static final String PRODUCT_VARIANTS = PATH_ID + "/variants";
    public static final String PRODUCT_IMAGES = PATH_ID + "/images";

    // Store front api group
    public static final String STOREFRONT_AUTH_BASE = STOREFRONT_BASE + "/auth";
    public static final String STOREFRONT_ADDRESSES = STOREFRONT_BASE + "/addresses";
    public static final String STOREFRONT_ORDERS = STOREFRONT_BASE + "/orders";
    //  Shared api
    public static final String CATEGORIES_BASE = API_BASE + "/categories";
}
