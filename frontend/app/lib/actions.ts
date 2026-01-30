"use server";

import { revalidateTag } from "next/cache";

export async function revalidateCategories() {
    revalidateTag("categories", "max");
}

export async function revalidateProducts() {
    revalidateTag("products", "max");
}

export async function revalidateCacheTags(tags: string[]) {
    tags.forEach((tag) => {
        revalidateTag(tag, "max");
    });
}
