export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  examples: string[];
}

export interface CategoriesData {
  categories: Category[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalCategories: number;
    defaultCategory: string;
  };
}
