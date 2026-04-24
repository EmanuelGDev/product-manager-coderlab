export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  parent?: Category | null;
  children?: Category[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  categories: {
    category: Category;
  }[];
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  categoryIds: number[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;