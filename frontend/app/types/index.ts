// Type definitions - re-exported from domain-specific files
// This barrel file is kept for backward compatibility
// For optimal bundle size, import directly from specific files:
// import type { Product } from "@/app/types/product"

// Product types
export type {
  Product,
  ProductVariant,
  ProductColor,
  ProductListResponse,
  SearchParams,
  RawProduct,
} from "./product";

// Cart types
export type { Cart, CartItem, AddToCartPayload } from "./cart";

// Category types
export type {
  Category,
  CategoryDetail,
  CategoryListResponse,
} from "./category";

// User types
export type { User, UserListResponse } from "./user";

// Attribute types
export type { Color, Size, Tag } from "./attributes";

// Review types
export type { Review, CreateReviewData, ReviewProduct } from "./review";

// Order types
export type {
  Order,
  OrderItem,
  OrderItemData,
  CreateOrderData,
  CreateOrderResponse,
  OrderStats,
  OrderListResponse,
} from "./order";

// Common types
export type { ApiResponse } from "./common";

// Header/Footer types
export type {
  NavigationItem,
  HeaderProps,
  HeaderIconType,
  HeaderIconProps,
  HeaderMainProps,
  HeaderNavigationProps,
  FooterLinkItem,
  FooterColumn,
  SocialLink,
  ContactInfo,
  CompanyInfo,
  FooterProps,
  FooterLogoProps,
  FooterLinksProps,
  FooterContactProps,
  MobileMenuProps,
  SearchModalProps,
  StickyHeaderState,
  HeaderScrollEffect,
  FooterSection,
} from "./header-footer";