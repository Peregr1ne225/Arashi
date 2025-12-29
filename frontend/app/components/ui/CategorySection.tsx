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
      <h2 className="text-4xl md:text-5xl font-black text-center mb-12 uppercase italic tracking-tighter text-foreground">
        Shop By <span className="text-accent">Category</span>
      </h2>

      <CategoryGrid categories={categories} />
      {/*<CategorySubcategory categories={categories} />*/}
    </div>
  );
}
