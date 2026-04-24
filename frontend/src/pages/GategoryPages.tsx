import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories } from '../hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '../api/categories';
import { CategoryForm } from '../components/CategoryForm';
import type { Category } from '../types';

export function CategoriesPage() {
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const { categories, loading, refresh } = useCategories();

  async function handleCreate(data: any) {
    try {
      await createCategory(data);
      toast.success('Categoria criada!');
      setModal(null);
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleUpdate(data: any) {
    if (!selected) return;
    try {
      await updateCategory(selected.id, data);
      toast.success('Categoria atualizada!');
      setModal(null);
      setSelected(null);
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Deletar "${category.name}"? Subcategorias também serão afetadas.`)) return;
    try {
      await deleteCategory(category.id);
      toast.success('Categoria removida!');
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // Organiza em árvore: pais e seus filhos
  const parents = categories.filter(c => !c.parentId);
  const children = categories.filter(c => c.parentId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Categorias</h1>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
        >
          <Plus size={16} /> Nova Categoria
        </button>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-20">Carregando...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-400 py-20">Nenhuma categoria encontrada.</p>
        ) : (
          <div className="space-y-3">
            {parents.map(parent => (
              <div key={parent.id} className="bg-white rounded-lg border overflow-hidden">
                {/* Categoria pai */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-semibold text-sm text-gray-800">{parent.name}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setSelected(parent); setModal('edit'); }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-black"
                    >
                      <Pencil size={13} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(parent)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={13} /> Excluir
                    </button>
                  </div>
                </div>

                {/* Subcategorias */}
                {children.filter(c => c.parentId === parent.id).map(child => (
                  <div key={child.id} className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ChevronRight size={13} className="text-gray-400" />
                      {child.name}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setSelected(child); setModal('edit'); }}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-black"
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(child)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={13} /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              {modal === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
            </h2>
            <CategoryForm
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