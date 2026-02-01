export interface AvatarAsset {
    id: number;
    name: string;
    slug: string;
    type: "shirt" | "pant";
    file: string;
    thumbnail: string | null;
    description: string;
}

export interface Avatar {
    id: number;
    name: string;
    slug: string;
    description: string;
    base_file: string;
    thumbnail: string | null;
    assets: AvatarAsset[];
}
