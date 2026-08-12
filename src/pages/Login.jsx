import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import CopaLoginLayout from '@/components/CopaLoginLayout';
import { TEMA, RAIO_PILULA } from '@/lib/tema';

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

  function entrar(e) {
    e.preventDefault();
    setCarregando(true);
    // Pequeno atraso para a transicao nao parecer instantanea demais.
    setTimeout(() => {
      sessionStorage.setItem('fifa27_sessao', email.trim() || 'demo@apsis.com.br');
      navigate('/painel', { replace: true });
    }, 450);
  }

  return (
    <CopaLoginLayout>
      <div className="w-full text-center">
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-semibold"
          style={{ color: TEMA.azul }}
        >
          Portal de Documentação
        </p>
        <h2 className="text-xl font-bold mt-1" style={{ color: TEMA.azulMarinho }}>
          Gestão Regulatória
        </h2>
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
          style={{ background: TEMA.amarelo, color: TEMA.azul, borderRadius: RAIO_PILULA }}
        >
          {carregando ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Entrando...</>
          ) : (
            <>Entrar <ArrowRight className="h-4 w-4" /></>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-400 pt-1">
          Protótipo de demonstração: entre com qualquer credencial.
        </p>
      </form>
    </CopaLoginLayout>
  );
}
