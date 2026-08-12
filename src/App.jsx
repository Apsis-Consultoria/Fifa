import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Instalacoes from '@/pages/Instalacoes';
import InstalacaoDetalhe from '@/pages/InstalacaoDetalhe';

function Protegida({ children }) {
  if (!sessionStorage.getItem('fifa27_sessao')) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    // `basename` e a mesma base do Vite: no dev vale `/`, publicado no GitHub Pages
    // vale `/Fifa/`. Sem ele as rotas continuariam sendo escritas na raiz do
    // dominio, e um `navigate('/painel')` sairia do site para uma pagina que o
    // GitHub nao conhece.
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Login />} />
        {/* O mapa passou a viver dentro da visao gerencial. */}
        <Route path="/mapa" element={<Navigate to="/painel" replace />} />
        <Route path="/painel" element={<Protegida><Dashboard /></Protegida>} />
        <Route path="/instalacoes" element={<Protegida><Instalacoes /></Protegida>} />
        <Route path="/instalacoes/:id" element={<Protegida><InstalacaoDetalhe /></Protegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
