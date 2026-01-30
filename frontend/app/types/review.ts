// Review-related types

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

export interface ReviewProduct {
    id: number;
    name: string;
    images: string[];
}
