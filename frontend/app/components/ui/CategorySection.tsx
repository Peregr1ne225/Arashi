import { Category } from "@/app/types";
import CategoryGrid from "./CategorySectionParts/CategoryGrid";
import CategorySubcategory from "./CategorySectionParts/CategorySubcategory";

export default function CategorySection({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <div className="container mx-auto px-4 py-12 pt-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 pt-8">
        Shop By Category
      </h2>

      <CategoryGrid categories={categories} />
      {/*<CategorySubcategory categories={categories} />*/}
    </div>
  );
}
