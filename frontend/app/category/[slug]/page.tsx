

import CatalogLayout from "@/app/components/layout/CatalogLayout";
import ProductCatalog from "@/app/components/product/ProductCatalog";
import { productsApi, categoriesApi } from "@/app/lib/api/client";
import { notFound } from "next/navigation";
import Link from "next/link";

// Separate data fetching function
async function getCategoryData(slug: string) {
  try {
    const decodedSlug = decodeURIComponent(slug);

    // First, get the category details
    const category = await categoriesApi.getCategoryBySlug(decodedSlug);

    // Then, get products for this category
    const { results: categoryProducts, count } = await productsApi.getProducts({
      category_slug: decodedSlug,
      page_size: 50, // Load up to 50 products
    });

    return {
      category,
      products: categoryProducts,
      count,
      found: true,
    };
  } catch (error: any) {
    console.error("Error fetching category data:", error);
    return {
      category: {
        id: 0,
        name: `Error: ${error.message}`,
        slug: 'error',
        description: `API URL: ${process.env.INTERNAL_API_URL}`,
        image: null,
        parent: null,
        children: []
      },
      products: [],
      count: 0,
      found: true, // Force render to show error
    };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category, products, count, found } = await getCategoryData(slug);

  // If category not found, return 404
  if (!found || !category) {
    notFound();
  }

  const breadcrumb = (
    <>
      <Link href="/" className="hover:text-gray-900">Home</Link>
      <span className="mx-2">/</span>
      <span className="text-gray-900 capitalize">{category.name}</span>
    </>
  );

  return (
    <CatalogLayout
      title={category.name}
      description={category.description}
      breadcrumb={breadcrumb}
    >
      <ProductCatalog
        initialProducts={products}
        initialCount={count}
        fetchMode="category"
        fetchParams={{
          category_id: category.id,
          category_slug: category.slug
        }}
      />
    </CatalogLayout>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const category = await categoriesApi.getCategoryBySlug(decodedSlug);

    return {
      title: `${category.name} | E-Commerce Store`,
      description:
        category.description ||
        `Browse our collection of ${category.name.toLowerCase()} products.`,
    };
  } catch (error) {
    // If category not found, return default metadata
    return {
      title: "Category Not Found | E-Commerce Store",
      description: "The requested category could not be found.",
    };
  }
}


