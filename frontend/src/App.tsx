import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/GategoryPages';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <nav className="bg-white border-b px-6 py-3 flex gap-6">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'}`
          }
        >
          Produtos
        </NavLink>
        <NavLink
          to="/categorias"
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'}`
          }
        >
          Categorias
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
      </Routes>
    </BrowserRouter>
  );
}