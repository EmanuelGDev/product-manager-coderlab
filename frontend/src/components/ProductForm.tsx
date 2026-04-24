import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../types';

const schema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  price: z.number({ error: 'Informe um preço válido' }).positive('Preço deve ser maior que zero').min(0.01),
  categoryIds: z.array(z.number()).min(1, 'Selecione pelo menos uma categoria'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initial?: Product;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initial, onSubmit, onCancel }: Props) {
  const { categories } = useCategories();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial ? {
      name: initial.name,
      description: initial.description,
      price: initial.price,
      categoryIds: initial.categories.map(c => c.category.id),
    } : { categoryIds: [] },
  });

  const selectedIds = watch('categoryIds') ?? [];

  function toggleCategory(id: number) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    setValue('categoryIds', next, { shouldValidate: true });
  }

  // Organiza: categorias pai primeiro, depois filhos agrupados
  const parents = categories.filter(c => !c.parentId);
  const children = categories.filter(c => c.parentId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Nome</label>
        <input {...register('name')} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-500" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Descrição</label>
        <textarea {...register('description')} rows={3} className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-500" />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Preço (R$)</label>
        <input
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-500"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categorias</label>
        <div className="border rounded p-3 space-y-2 max-h-48 overflow-y-auto">
          {parents.map(parent => (
            <div key={parent.id}>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(parent.id)}
                  onChange={() => toggleCategory(parent.id)}
                />
                {parent.name}
              </label>
              {children.filter(c => c.parentId === parent.id).map(child => (
                <label key={child.id} className="flex items-center gap-2 cursor-pointer text-sm ml-5 text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(child.id)}
                    onChange={() => toggleCategory(child.id)}
                  />
                  {child.name}
                </label>
              ))}
            </div>
          ))}
        </div>
        {errors.categoryIds && <p className="text-red-500 text-xs mt-1">{errors.categoryIds.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50">
          {isSubmitting ? 'Salvando...' : initial ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}