import type { CreateProductPayload, UpdateProductPayload } from '../types';

const BASE = 'http://localhost:3000';

export async function getProducts() {
  const res = await fetch(`${BASE}/products`);
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  return res.json();
}

export async function getProduct(id: number) {
  const res = await fetch(`${BASE}/products/${id}`);
  if (!res.ok) throw new Error('Produto não encontrado');
  return res.json();
}

export async function createProduct(data: CreateProductPayload) {
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Erro ao criar produto');
  }
  return res.json();
}

export async function updateProduct(id: number, data: UpdateProductPayload) {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Erro ao atualizar produto');
  }
  return res.json();
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${BASE}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao deletar produto');
  return res.json();
}