import { Category } from "@/app/types";
import { categoriesApi } from "@/app/lib/api/client";
import HeaderClient from "@/app/components/client/HeaderClient";

// Server component to fetch categories and pass to client component
export default async function HeaderServer() {
  // Fetch categories on the server
  let categories: Category[] = [];
  try {
    categories = await categoriesApi.getCategories();
  } catch (error) {
    // This suppresses build-time errors when backend is not available
    console.warn("Failed to fetch categories (likely during build):", error);
  }

  return <HeaderClient categories={categories} />;
}
