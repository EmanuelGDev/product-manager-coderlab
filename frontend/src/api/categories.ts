import type { CreateCategoryPayload, UpdateCategoryPayload } from '../types';

const BASE = 'http://localhost:3000';

export async function getCategories() {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) throw new Error('Erro ao buscar categorias');
  return res.json();
}

export async function getCategory(id: number) {
  const res = await fetch(`${BASE}/categories/${id}`);
  if (!res.ok) throw new Error('Categoria não encontrada');
  return res.json();
}

export async function createCategory(data: CreateCategoryPayload) {
  const res = await fetch(`${BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Erro ao criar categoria');
  }
  return res.json();
}

export async function updateCategory(id: number, data: UpdateCategoryPayload) {
  const res = await fetch(`${BASE}/categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Erro ao atualizar categoria');
  }
  return res.json();
}

export async function deleteCategory(id: number) {
  const res = await fetch(`${BASE}/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Erro ao deletar categoria');
  }
  return res.json();
}