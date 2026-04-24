import { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '../hooks/useProducts';
import { createProduct, updateProduct, deleteProduct } from '../api/products';
import { ProductForm } from '../components/ProductForm';
import type { Product } from '../types';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const { products, loading, refresh } = useProducts(search);

  async function handleCreate(data: any) {
    try {
      await createProduct(data);
      toast.success('Produto criado!');
      setModal(null);
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleUpdate(data: any) {
    if (!selected) return;
    try {
      await updateProduct(selected.id, data);
      toast.success('Produto atualizado!');
      setModal(null);
      setSelected(null);
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Deletar "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      toast.success('Produto removido!');
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Produtos</h1>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
        >
          <Plus size={16} /> Novo Produto
        </button>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {/* Filtro */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-9 pr-4 py-2 border rounded text-sm bg-white"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <p className="text-center text-gray-400 py-20">Carregando...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-400 py-20">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg border p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-sm leading-tight text-gray-800">{product.name}</h2>
                  <span className="text-sm font-bold text-green-600 whitespace-nowrap ml-2">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                <div className="flex flex-wrap gap-1">
                  {product.categories.map(({ category }) => (
                    <span key={category.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {category.name}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-auto pt-2 border-t">
                  <button
                    onClick={() => { setSelected(product); setModal('edit'); }}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-black"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 ml-auto"
                  >
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {modal === 'create' ? 'Novo Produto' : 'Editar Produto'}
            </h2>
            <ProductForm
              initial={modal === 'edit' ? selected ?? undefined : undefined}
              onSubmit={modal === 'create' ? handleCreate : handleUpdate}
              onCancel={() => { setModal(null); setSelected(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}