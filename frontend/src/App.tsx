import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProductsPage } from './pages/ProductsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="*" element={<p className="p-8 text-center">Página não encontrada</p>} />
      </Routes>
    </BrowserRouter>
  );
}