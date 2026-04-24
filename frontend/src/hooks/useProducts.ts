import { useEffect, useState, useCallback } from 'react';
import { getProducts } from '../api/products';
import type { Product } from '../types';

export function useProducts(search: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    getProducts()
      .then((data: Product[]) => {
        const filtered = search
          ? data.filter(p =>
              p.name.toLowerCase().includes(search.toLowerCase())
            )
          : data;
        setProducts(filtered);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { refresh(); }, [refresh]);

  return { products, loading, refresh };
}