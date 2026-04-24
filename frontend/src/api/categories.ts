const BASE = 'http://localhost:3000';

export async function getCategories() {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) throw new Error('Erro ao buscar categorias');
  return res.json();
}