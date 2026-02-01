import ProductCatalog from "@/app/components/product/ProductCatalog";
import { productsApi, categoriesApi } from "@/app/lib/api/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import CatalogDataLoader from "@/app/components/utils/CatalogDataLoader";

// Separate data fetching function - Just for initial category details
async function getCategory(slugParts: string[]) {
  try {
    const path = slugParts.map(p => decodeURIComponent(p)).join('/');
    // Get the category details
    const category = await categoriesApi.getCategoryBySlug(path);
    return { category, found: true, path };
  } catch (error) {
    console.error("Error fetching category details:", error);
    return { category: null, found: false, path: '' };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const { category, found, path } = await getCategory(slug);

  // If category not found, return 404
  if (!found || !category) {
    notFound();
  }

  const breadcrumb = (
    <>
      <Link href="/" className="hover:text-gray-900">Home</Link>
      <span className="mx-2">/</span>
      {/* We could improve this to show full hierarchy link if we had parent info loaded recursively */}
      <span className="text-gray-900 capitalize">{category.name}</span>
    </>
  );

  const productPromise = productsApi.getProducts({
    category: category.id,
    page_size: 50,
  });

  return (
    <CatalogDataLoader productPromise={productPromise}>
      {({ products, categories, count }) => (
        <ProductCatalog
          initialProducts={products}
          initialCategories={categories}
          initialCount={count}
          fetchMode="category"
          fetchParams={{
            category_id: category.id,
            category_slug: path // Pass path for consistency
          }}
          title={category.name}
          breadcrumb={breadcrumb}
        />
      )}
    </CatalogDataLoader>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.map(p => decodeURIComponent(p)).join('/');

  try {
    const category = await categoriesApi.getCategoryBySlug(path);

    return {
      title: `${category.name} | E-Commerce Store`,
      description:
        category.description ||
        `Browse our collection of ${category.name.toLowerCase()} products.`,
    };
  } catch {
    // If category not found, return default metadata
    return {
      title: "Category Not Found | E-Commerce Store",
      description: "The requested category could not be found.",
    };
  }
}


