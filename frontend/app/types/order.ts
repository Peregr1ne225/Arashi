export interface OrderItemData {
    product_id: number;
    quantity: number;
    price: number;
    color_id?: number | null;
    size_id?: number | null;
}

export interface CreateOrderData {
    full_name: string;
    phone_number: string;
    shipping_address: string;
    total_amount: number;
    items: OrderItemData[];
}

export interface Order {
    id: number;
    display_id: string;
    user: number;
    full_name: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    total_amount: number;
    shipping_address: string;
    phone_number: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
    payment_status?: string; // e.g. "pending", "paid"
    stripe_checkout_session_id?: string;
    tracking_number?: string;
}

export interface CreateOrderResponse {
    checkout_url: string;
}

export interface OrderItem {
    id: number;
    order: number;
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        images: string[];
        discount?: number;
        discounted_price?: number;
        stock: number;
    };
    quantity: number;
    price: number; // Price sold at
    original_price?: number; // Snapshot of product price at time of order
    is_rated?: boolean;
    color_name?: string;
    size_name?: string;
}

export interface OrderStats {
    total_orders: number;
    total_revenue: number;
    status_counts: {
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
}

export interface OrderListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Order[];
}
