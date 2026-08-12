import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, LogOut } from 'lucide-react';
import { MarcaTorneio } from '@/components/CopaLayout';
import { TEMA, FONTE, RAIO_PILULA } from '@/lib/tema';
import { comBase } from '@/lib/assets';

const ITENS = [
  { to: '/painel',      icone: LayoutDashboard, label: 'Visão gerencial' },
  { to: '/instalacoes', icone: Building2,       label: 'Instalações' },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();

  function sair() {
    sessionStorage.removeItem('fifa27_sessao');
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen flex" style={{ background: TEMA.creme, fontFamily: FONTE }}>
      {/* Barra lateral no azul do torneio, como a navegacao do site oficial */}
      {/* sticky + h-screen: sem isso a barra estica junto com a pagina e o menu
          fica abaixo da dobra em telas longas, como a do mapa. */}
      <aside
        className="hidden lg:flex w-64 flex-col flex-shrink-0 sticky top-0 h-screen"
        style={{ background: TEMA.azul }}
      >
        <div className="px-5 py-6 border-b border-white/15">
          <MarcaTorneio largura={150} />
          <p className="mt-5 text-[10px] uppercase tracking-[0.18em] font-semibold text-center" style={{ color: TEMA.amarelo }}>
            Gestão Regulatória
          </p>
          <p className="text-xs text-white/60 mt-1 leading-snug text-center">
            Licenciamento de Instalações
          </p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5">
          {ITENS.map(({ to, icone: Icone, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'font-semibold' : 'text-white/70 hover:bg-[#FFD033]/20 hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                borderRadius: RAIO_PILULA,
                background: isActive ? TEMA.amarelo : undefined,
                color: isActive ? TEMA.azul : undefined,
              })}
            >
              <Icone className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 space-y-1.5 border-t border-white/15">
          <button
            onClick={sair}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:bg-[#FFD033]/20 hover:text-white transition-colors"
            style={{ borderRadius: RAIO_PILULA }}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>

          <div className="pt-3 px-4 flex items-center gap-2">
            <img
              src={comBase("/login/logo-apsis-transp.png")}
              alt="APSIS"
              className="h-5 object-contain brightness-0 invert opacity-70"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-[10px] text-white/40">Consultoria</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
