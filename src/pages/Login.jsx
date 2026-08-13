import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, ArrowRight, PlayCircle } from 'lucide-react';
import CopaLoginLayout from '@/components/CopaLoginLayout';
import { TEMA, RAIO_PILULA, FONTE_TITULO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO } from '@/lib/tema';

// Prototipo: nao ha autenticacao real. Ao plugar o backend, este handler chama a
// Edge Function client-login do Secure Share, que ja emite token de sessao assinado.

const CAMPO =
  'w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-sm text-slate-700 ' +
  'placeholder:text-slate-400 shadow-sm transition-colors outline-none ' +
  'focus:border-[#1807E5] focus:ring-2 focus:ring-[#1807E5]/20 disabled:opacity-60';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  function abrirSessao(usuario) {
    setCarregando(true);
    // Pequeno atraso para a transicao nao parecer instantanea demais.
    setTimeout(() => {
      sessionStorage.setItem('fifa27_sessao', usuario);
      navigate('/painel', { replace: true });
    }, 450);
  }

  function entrar(e) {
    e.preventDefault();
    abrirSessao(email.trim() || 'demo@apsis.com.br');
  }

  return (
    <CopaLoginLayout>
      {/* O titulo do sistema vive aqui, no painel. Antes ficava sobre a foto, mas
          com a arte oficial de fundo ele disputava com a taca e o letreiro. */}
      <div className="w-full text-center">
        {/* Sans-serif neutra e bold, a pedido do Filipe: a Poppins do resto da
            marca deixava o titulo com desenho geometrico demais para um titulo
            de sistema. */}
        <h2
          className="text-lg lg:text-xl leading-snug uppercase tracking-wide"
          style={{ color: TEMA.azulMarinho, fontFamily: FONTE_TITULO, fontWeight: 700 }}
        >
          Gestão Regulatória e Licenciamento de Instalações
        </h2>
        <div className="mt-3 mx-auto h-[3px] w-14 rounded-full" style={{ background: TEMA.amarelo }} />
      </div>

      <form onSubmit={entrar} className="w-full space-y-3 mt-2">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            disabled={carregando}
            className={CAMPO}
            style={{ borderRadius: RAIO_PILULA }}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            disabled={carregando}
            className={CAMPO}
            style={{ borderRadius: RAIO_PILULA }}
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm !mt-5"
          style={BOTAO_PRIMARIO}
        >
          {carregando ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Entrando...</>
          ) : (
            <>Entrar <ArrowRight className="h-4 w-4" /></>
          )}
        </button>

        {/* Atalho para quem so quer ver o sistema: nao ha autenticacao real, e
            pedir para inventar um usuario antes de olhar so atrapalha. */}
        <button
          type="button"
          disabled={carregando}
          onClick={() => abrirSessao('demo@apsis.com.br')}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors hover:bg-[#1807E5]/[0.06] disabled:opacity-60"
          style={BOTAO_SECUNDARIO}
        >
          <PlayCircle className="h-4 w-4" />
          Entrar no modo demonstração
        </button>

        <p className="text-center text-[11px] text-slate-400 pt-1">
          Protótipo de demonstração: entre com qualquer credencial.
        </p>
      </form>
    </CopaLoginLayout>
  );
}
