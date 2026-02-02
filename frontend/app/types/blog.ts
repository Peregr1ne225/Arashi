// Blog-related types

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    image?: string;
    author_name: string;
    author_username: string;
    comment_count: number;
    likes_count: number;
    has_liked?: boolean;
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
    author_name: string;
    content: string;
    image?: string | null;
    created_at: string;
    is_active: boolean;
    can_delete?: boolean;
    author_username?: string;
    post_author_username?: string;
    average_rating?: number;
    likes_count?: number;
    has_liked?: boolean;
}

export interface BlogCommentListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: BlogComment[];
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
