import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '../hooks/useCategories';
import type { Category } from '../types';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  parentId: z.number().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initial?: Category;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initial, onSubmit, onCancel }: Props) {
  const { categories } = useCategories();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      parentId: initial?.parentId ?? null,
    },
  });

  // Filtra categorias pai disponíveis:
  // - Não pode ser ela mesma
  // - Não pode ser filha dela (evita loop de hierarquia)
  const availableParents = categories.filter(c => {
    if (!initial) return true;
    if (c.id === initial.id) return false;
    // verifica se c é descendente de initial
    let current: Category | undefined = c;
    while (current?.parentId) {
      if (current.parentId === initial.id) return false;
      current = categories.find(x => x.id === current!.parentId);
    }
    return true;
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Nome</label>
        <input
          {...register('name')}
          className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-700"
          placeholder="Ex: Eletrônicos"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Categoria pai <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <select
          {...register('parentId', { setValueAs: v => v === '' ? null : Number(v) })}
          className="w-full border rounded px-3 py-2 text-sm bg-white text-gray-700"
        >
          <option value="">Nenhuma (categoria raiz)</option>
          {availableParents.map(c => (
            <option key={c.id} value={c.id}>
              {c.parentId ? `↳ ${c.name}` : c.name}
            </option>
          ))}
        </select>
        {errors.parentId && <p className="text-red-500 text-xs mt-1">{errors.parentId.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : initial ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}