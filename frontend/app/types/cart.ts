import { RawProduct } from "./product";

export interface AddToCartPayload {
    product_id: number;
    quantity: number;
    color_id?: number;
    size_id?: number;
}

export interface CartItem {
    id: number;
    product_id: number;
    product: RawProduct;
    quantity: number;
    total_price: string;
    color_id?: number;
    size_id?: number;
    color_name?: string;
    size_name?: string;
}

export interface Cart {
    id: number;
    items: CartItem[];
    total_price: string;
    total_items: number;
}
