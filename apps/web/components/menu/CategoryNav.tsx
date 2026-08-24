"use client";

import React from "react";
import type { CategoryWithItems } from "@/lib/queries/menu";

interface CategoryNavProps {
  categories: CategoryWithItems[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <nav
      aria-label="Menu categories"
      className="sticky top-0 z-30 w-full border-b border-stone-200/80 bg-[#FDFBF7]/90 backdrop-blur-md dark:border-stone-800 dark:bg-[#141211]/90"
    >
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar scroll-smooth">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-stone-900 text-white shadow-sm dark:bg-stone-100 dark:text-stone-900 font-semibold scale-[1.02]"
                  : "bg-stone-100/90 text-stone-600 hover:bg-stone-200/70 dark:bg-stone-800/80 dark:text-stone-300 dark:hover:bg-stone-700/80"
              }`}
            >
              {category.name}
              <span className="ml-1.5 opacity-60 text-[10px]">({category.items.length})</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
