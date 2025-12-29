// Type definitions for backend API responses
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;     // Main image URL (mapped from main_image or images[0])
  image_url?: string;       // Deprecated
  category: Category;
  category_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // UI-specific properties (not from backend)
  originalPrice?: number;
  discount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  subcategory?: string;
  images: string[];         // Array of image URLs
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  image: string | null;
  children: Category[];
  created_at: string;
  updated_at: string;
}

export interface CategoryDetail extends Category {
  products: Product[];
}

export interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CategoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export interface SearchParams {
  q?: string;
  category?: number;
  category_slug?: string;
  min_price?: number;
  max_price?: number;
  ordering?: string;
  active_only?: boolean;
  is_new?: boolean;
  is_sale?: boolean;
  page?: number;
  page_size?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

// Blog types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  author_pseudonym: string;
  author_username: string;
  comment_count: number;
  is_owner?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPostDetail extends BlogPost {
  comments: BlogComment[];
}

export interface BlogComment {
  id: number;
  post: number;
  author_pseudonym: string;
  content: string;
  image?: string | null;
  created_at: string;
  is_active: boolean;
  can_delete?: boolean;
  author_username?: string;
  post_author_username?: string;
}

export interface BlogPostListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
}

export interface CreatePostData {
  title: string;
  content: string;
  image?: File;
}

export interface CreateCommentData {
  post: number;
  content: string;
}

export interface Review {
  id: number;
  user: number;
  user_username: string;
  product: number;
  order: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CreateReviewData {
  product: number;
  order: number;
  rating: number;
  comment: string;
}

