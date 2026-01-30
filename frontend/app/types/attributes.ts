// Product attribute types (colors, sizes, tags)

export interface Color {
    id: number;
    name: string;
    code: string;
    product_count?: number;
}

export interface Size {
    id: number;
    name: string;
    slug: string;
    product_count?: number;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    product_count?: number;
}
