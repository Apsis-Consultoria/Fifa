import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, LogOut } from 'lucide-react';
import { MarcaTorneio } from '@/components/CopaLayout';
import { TEMA, FONTE, RAIO_PILULA, REALCE } from '@/lib/tema';
import { comBase } from '@/lib/assets';

const ITENS = [
  { to: '/painel',      icone: LayoutDashboard, label: 'Visão gerencial' },
  { to: '/instalacoes', icone: Building2,       label: 'Instalações' },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  // O realce de hover e escrito direto no DOM, entao o item ativo precisa ser
  // conhecido fora do NavLink para o azul solido nao ser pintado por cima.
  const { pathname } = useLocation();

  function sair() {
    sessionStorage.removeItem('fifa27_sessao');
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen flex" style={{ background: TEMA.branco, fontFamily: FONTE }}>
      {/* Barra lateral branca, separada do conteudo apenas pela borda cinza */}
      {/* sticky + h-screen: sem isso a barra estica junto com a pagina e o menu
          fica abaixo da dobra em telas longas, como a do mapa. */}
      <aside
        className="hidden lg:flex w-64 flex-col flex-shrink-0 sticky top-0 h-screen border-r"
        style={{ background: TEMA.branco, borderColor: TEMA.borda }}
      >
        <div className="px-5 py-6 border-b" style={{ borderColor: TEMA.borda }}>
          <MarcaTorneio largura={150} />
          <p className="mt-5 text-[10px] uppercase tracking-[0.18em] font-semibold text-center" style={{ color: TEMA.azul }}>
            Gestão Regulatória
          </p>
          <p className="text-xs mt-1 leading-snug text-center" style={{ color: TEMA.textoSuave }}>
            Licenciamento de Instalações
          </p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5">
          {ITENS.map(({ to, icone: Icone, label }) => {
            const ativo = pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${ativo ? 'font-semibold' : ''}`}
                style={{
                  borderRadius: RAIO_PILULA,
                  background: ativo ? TEMA.azul : 'transparent',
                  color: ativo ? TEMA.branco : TEMA.textoSuave,
                }}
                onMouseEnter={(e) => { if (!ativo) e.currentTarget.style.background = REALCE; }}
                onMouseLeave={(e) => { if (!ativo) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icone className="h-4 w-4 flex-shrink-0" style={{ color: ativo ? TEMA.branco : TEMA.azul }} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 space-y-1.5 border-t" style={{ borderColor: TEMA.borda }}>
          <button
            onClick={sair}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
            style={{ borderRadius: RAIO_PILULA, color: TEMA.textoSuave }}
            onMouseEnter={(e) => { e.currentTarget.style.background = REALCE; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut className="h-4 w-4" style={{ color: TEMA.azul }} />
            Sair
          </button>

          <div className="pt-3 px-4 flex items-center gap-2">
            <img
              src={comBase("/login/logo-apsis-transp.png")}
              alt="APSIS"
              className="h-5 object-contain opacity-70"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-[10px]" style={{ color: TEMA.textoFraco }}>Consultoria</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
