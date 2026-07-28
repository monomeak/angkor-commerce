#!/usr/bin/env bash
set -euo pipefail

BASE="apps/api/src/main/java/com/acme/invoice"

# Helper: create a file only if it doesn't already exist
create_file() {
  local path="$1"
  if [ -e "$path" ]; then
    echo "skip (exists): $path"
  else
    touch "$path"
    echo "created: $path"
  fi
}

# ---- Directories ----
DIRS=(
  "$BASE/user/impl"
  "$BASE/user/dto/request"
  "$BASE/user/dto/response"

  "$BASE/auth/impl"
  "$BASE/auth/dto/request"
  "$BASE/auth/dto/response"

  "$BASE/customer/impl"
  "$BASE/customer/dto/request"
  "$BASE/customer/dto/response"

  "$BASE/product/impl"
  "$BASE/product/dto/request"
  "$BASE/product/dto/response"

  "$BASE/invoice/impl"
  "$BASE/invoice/dto/request"
  "$BASE/invoice/dto/response"

  "$BASE/payment/impl"
  "$BASE/payment/dto/request"
  "$BASE/payment/dto/response"

  "$BASE/dashboard/impl"
  "$BASE/dashboard/dto/response"

  "$BASE/report/impl"
  "$BASE/report/dto/response"

  "$BASE/audit/impl"
  "$BASE/audit/dto/response"

  "$BASE/security"

  "$BASE/common/dto"
  "$BASE/common/enums"
  "$BASE/common/exception"

  "$BASE/config"
)

echo "== Creating directories =="
for d in "${DIRS[@]}"; do
  mkdir -p "$d"
  echo "ensured dir: $d"
done

echo ""
echo "== Creating files =="

# ---- user ----
create_file "$BASE/user/User.java"
create_file "$BASE/user/Role.java"
create_file "$BASE/user/UserController.java"
create_file "$BASE/user/UserService.java"
create_file "$BASE/user/UserRepository.java"
create_file "$BASE/user/impl/UserServiceImpl.java"
create_file "$BASE/user/dto/request/CreateUserRequest.java"
create_file "$BASE/user/dto/request/UpdateUserRequest.java"
create_file "$BASE/user/dto/response/UserResponse.java"
create_file "$BASE/user/dto/response/UserSummaryResponse.java"

# ---- auth ----
create_file "$BASE/auth/RefreshToken.java"
create_file "$BASE/auth/AuthController.java"
create_file "$BASE/auth/AuthService.java"
create_file "$BASE/auth/RefreshTokenRepository.java"
create_file "$BASE/auth/impl/AuthServiceImpl.java"
create_file "$BASE/auth/dto/request/LoginRequest.java"
create_file "$BASE/auth/dto/request/RefreshRequest.java"
create_file "$BASE/auth/dto/response/AuthTokenResponse.java"
create_file "$BASE/auth/dto/response/CurrentUserResponse.java"

# ---- customer ----
create_file "$BASE/customer/Customer.java"
create_file "$BASE/customer/CustomerController.java"
create_file "$BASE/customer/CustomerService.java"
create_file "$BASE/customer/CustomerRepository.java"
create_file "$BASE/customer/impl/CustomerServiceImpl.java"
create_file "$BASE/customer/dto/request/CreateCustomerRequest.java"
create_file "$BASE/customer/dto/request/UpdateCustomerRequest.java"
create_file "$BASE/customer/dto/response/CustomerResponse.java"
create_file "$BASE/customer/dto/response/CustomerSummaryResponse.java"

# ---- product ----
create_file "$BASE/product/Product.java"
create_file "$BASE/product/ProductController.java"
create_file "$BASE/product/ProductService.java"
create_file "$BASE/product/ProductRepository.java"
create_file "$BASE/product/impl/ProductServiceImpl.java"
create_file "$BASE/product/dto/request/CreateProductRequest.java"
create_file "$BASE/product/dto/request/UpdateProductRequest.java"
create_file "$BASE/product/dto/response/ProductResponse.java"

# ---- invoice ----
create_file "$BASE/invoice/Invoice.java"
create_file "$BASE/invoice/InvoiceItem.java"
create_file "$BASE/invoice/InvoiceController.java"
create_file "$BASE/invoice/InvoiceService.java"
create_file "$BASE/invoice/InvoiceRepository.java"
create_file "$BASE/invoice/InvoiceItemRepository.java"
create_file "$BASE/invoice/impl/InvoiceServiceImpl.java"
create_file "$BASE/invoice/dto/request/CreateInvoiceRequest.java"
create_file "$BASE/invoice/dto/request/UpdateInvoiceRequest.java"
create_file "$BASE/invoice/dto/request/InvoiceItemRequest.java"
create_file "$BASE/invoice/dto/response/InvoiceResponse.java"
create_file "$BASE/invoice/dto/response/InvoiceSummaryResponse.java"
create_file "$BASE/invoice/dto/response/InvoiceItemResponse.java"

# ---- payment ----
create_file "$BASE/payment/Payment.java"
create_file "$BASE/payment/PaymentController.java"
create_file "$BASE/payment/PaymentService.java"
create_file "$BASE/payment/PaymentRepository.java"
create_file "$BASE/payment/impl/PaymentServiceImpl.java"
create_file "$BASE/payment/dto/request/RecordPaymentRequest.java"
create_file "$BASE/payment/dto/response/PaymentResponse.java"

# ---- dashboard ----
create_file "$BASE/dashboard/DashboardController.java"
create_file "$BASE/dashboard/DashboardService.java"
create_file "$BASE/dashboard/impl/DashboardServiceImpl.java"
create_file "$BASE/dashboard/dto/response/DashboardSummaryResponse.java"
create_file "$BASE/dashboard/dto/response/RecentInvoiceResponse.java"

# ---- report ----
create_file "$BASE/report/ReportController.java"
create_file "$BASE/report/ReportService.java"
create_file "$BASE/report/impl/ReportServiceImpl.java"
create_file "$BASE/report/dto/response/ReportResponse.java"

# ---- audit ----
create_file "$BASE/audit/AuditLog.java"
create_file "$BASE/audit/AuditController.java"
create_file "$BASE/audit/AuditService.java"
create_file "$BASE/audit/AuditLogRepository.java"
create_file "$BASE/audit/impl/AuditServiceImpl.java"
create_file "$BASE/audit/dto/response/AuditLogResponse.java"

# ---- security ----
create_file "$BASE/security/SecurityConfig.java"
create_file "$BASE/security/JwtAuthenticationFilter.java"
create_file "$BASE/security/JwtTokenProvider.java"
create_file "$BASE/security/CustomUserDetailsService.java"
create_file "$BASE/security/RestAuthenticationEntryPoint.java"
create_file "$BASE/security/CustomAccessDeniedHandler.java"

# ---- common ----
create_file "$BASE/common/BaseEntity.java"
create_file "$BASE/common/dto/ApiResponse.java"
create_file "$BASE/common/dto/PageResponse.java"
create_file "$BASE/common/enums/InvoiceStatus.java"
create_file "$BASE/common/enums/RecordStatus.java"
create_file "$BASE/common/exception/GlobalExceptionHandler.java"
create_file "$BASE/common/exception/ResourceNotFoundException.java"
create_file "$BASE/common/exception/ValidationException.java"

# ---- config ----
create_file "$BASE/config/OpenApiConfig.java"
create_file "$BASE/config/JpaConfig.java"
create_file "$BASE/config/JacksonConfig.java"
create_file "$BASE/config/CorsConfig.java"

echo ""
echo "Done. Package structure is ready under: $BASE"