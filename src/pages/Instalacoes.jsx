import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Trash2, X, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { useEstado, progresso, criarInstalacao, removerInstalacao } from '@/lib/store';
import { TIPOLOGIAS, catalogoPorTipologia } from '@/lib/catalogo';
import { TEMA, FONTE, RAIO_PILULA, corDoProgresso } from '@/lib/tema';

const CIDADES_SEDE = [
  'Rio de Janeiro', 'São Paulo', 'Porto Alegre', 'Belo Horizonte',
  'Brasília', 'Salvador', 'Recife', 'Fortaleza',
];

const CAMPO =
  'w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 ' +
  'placeholder:text-slate-400 transition-colors focus:outline-none focus:border-[#1807E5] ' +
  'focus:ring-2 focus:ring-[#1807E5]/20';

const rotuloTipologia = (id) => TIPOLOGIAS.find((t) => t.id === id)?.label || id;

/** Fundo do realce ao passar o mouse: o azul do torneio bem diluido. */
const REALCE = 'rgba(24,7,229,0.07)';

/** A escolha entre grade e lista acompanha o usuario entre as visitas. */
const CHAVE_VISUAL = 'fifa27_visual_instalacoes';

function FormularioNovaInstalacao({ aoFechar }) {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [tipologia, setTipologia] = useState('estadio');
  const [cidade, setCidade] = useState('Rio de Janeiro');
  const [responsavel, setResponsavel] = useState('');

  const exigidos = catalogoPorTipologia(tipologia).length;

  function salvar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    const inst = criarInstalacao({ nome, tipologia, cidade, responsavel });
    toast.success(`${inst.nome} criada com ${exigidos} documentos exigidos.`);
    navigate(`/instalacoes/${inst.id}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: FONTE }}>
              Nova instalação
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Os documentos exigidos são criados automaticamente a partir da tipologia.
            </p>
          </div>
          <button onClick={aoFechar} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={salvar} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nome da instalação</label>
            <input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Estádio do Maracanã"
              className={CAMPO}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipologia</label>
            <select value={tipologia} onChange={(e) => setTipologia(e.target.value)} className={CAMPO}>
              {TIPOLOGIAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} ({catalogoPorTipologia(t.id).length} documentos)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Cidade</label>
              <input
                list="cidades-sede"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className={CAMPO}
              />
              <datalist id="cidades-sede">
                {CIDADES_SEDE.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Responsável</label>
              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Ex: Venue Authority"
                className={CAMPO}
              />
            </div>
          </div>

          <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(24,7,229,0.06)', border: '1px solid rgba(24,7,229,0.18)' }}>
            <p className="text-xs" style={{ color: TEMA.azul }}>
              Serão criados <strong>{exigidos} documentos</strong> exigidos para
              {' '}{rotuloTipologia(tipologia).toLowerCase()}, conforme o Anexo 2 da RFI 39.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nome.trim()}
              className="px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: TEMA.amarelo, color: TEMA.azul, borderRadius: RAIO_PILULA }}
            >
              Criar instalação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Alternador entre grade e lista. */
function SeletorVisual({ visual, aoTrocar }) {
  const OPCOES = [
    { id: 'grade', icone: LayoutGrid, rotulo: 'Grade' },
    { id: 'lista', icone: List,       rotulo: 'Lista' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-white border border-[#EFE7CE] rounded-full">
      {OPCOES.map(({ id, icone: Icone, rotulo }) => {
        const ativo = visual === id;
        return (
          <button
            key={id}
            onClick={() => aoTrocar(id)}
            title={`Ver em ${rotulo.toLowerCase()}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors rounded-full"
            style={{
              background: ativo ? TEMA.azul : 'transparent',
              color: ativo ? '#FFFFFF' : '#64748B',
            }}
            onMouseEnter={(e) => { if (!ativo) e.currentTarget.style.background = REALCE; }}
            onMouseLeave={(e) => { if (!ativo) e.currentTarget.style.background = 'transparent'; }}
          >
            <Icone className="h-3.5 w-3.5" />
            {rotulo}
          </button>
        );
      })}
    </div>
  );
}

/** Uma instalacao na visao em lista: os mesmos dados da grade, em uma linha so. */
function LinhaInstalacao({ inst, aoAbrir, aoExcluir }) {
  return (
    <div
      onClick={() => aoAbrir(inst)}
      className="px-5 py-3.5 flex items-center gap-5 cursor-pointer transition-colors group"
      onMouseEnter={(e) => { e.currentTarget.style.background = REALCE; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-800 truncate">{inst.nome}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">
          {rotuloTipologia(inst.tipologia)}
          {inst.cidade && ` · ${inst.cidade}`}
          {inst.responsavel && ` · ${inst.responsavel}`}
        </p>
      </div>

      <div className="w-40 hidden sm:block flex-shrink-0">
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${inst.percentual}%`, background: corDoProgresso(inst.percentual) }}
          />
        </div>
      </div>

      <div className="text-right w-24 flex-shrink-0">
        <p className="font-bold tabular-nums" style={{ fontFamily: FONTE, color: corDoProgresso(inst.percentual) }}>
          {inst.percentual}%
        </p>
        <p className="text-[11px] text-slate-400 tabular-nums">{inst.anexados}/{inst.total} docs</p>
      </div>

      <button
        onClick={(e) => aoExcluir(e, inst)}
        className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
        title="Excluir instalação"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#1807E5] transition-colors flex-shrink-0" />
    </div>
  );
}

export default function Instalacoes() {
  const estado = useEstado();
  const navigate = useNavigate();
  const [criando, setCriando] = useState(false);
  const [visual, setVisual] = useState(() => localStorage.getItem(CHAVE_VISUAL) || 'grade');

  useEffect(() => { localStorage.setItem(CHAVE_VISUAL, visual); }, [visual]);

  const lista = estado.instalacoes.map((inst) => ({
    ...inst,
    ...progresso(estado.documentos.filter((d) => d.instalacaoId === inst.id)),
  }));

  const abrir = (inst) => navigate(`/instalacoes/${inst.id}`);

  function excluir(e, inst) {
    e.stopPropagation();
    if (!window.confirm(`Excluir "${inst.nome}" e todos os seus documentos?`)) return;
    removerInstalacao(inst.id);
    toast.success('Instalação excluída.');
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1400px]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold" style={{ fontFamily: FONTE, color: TEMA.azulMarinho }}>
          Instalações
        </h1>
        <p className="text-slate-500 mt-1.5 text-sm">
          Estádios, centros de treinamento, IBC e demais instalações do torneio.
        </p>
        <div className="mt-4 h-[4px] w-28 rounded-full" style={{ background: TEMA.amarelo }} />
      </header>

      {/* Barra de acoes colada na lista: o botao de criar fica junto do conteudo
          que ele altera, e nao la em cima no cabecalho. */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <SeletorVisual visual={visual} aoTrocar={setVisual} />
          <span className="text-xs text-slate-400">
            {lista.length} instalaç{lista.length === 1 ? 'ão' : 'ões'}
          </span>
        </div>
        <button
          onClick={() => setCriando(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: TEMA.amarelo, color: TEMA.azul, borderRadius: RAIO_PILULA }}
        >
          <Plus className="h-4 w-4" />
          Nova instalação
        </button>
      </div>

      {visual === 'lista' && lista.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EFE7CE] shadow-sm overflow-hidden divide-y divide-slate-100">
          {lista.map((inst) => (
            <LinhaInstalacao key={inst.id} inst={inst} aoAbrir={abrir} aoExcluir={excluir} />
          ))}
        </div>
      )}

      {visual === 'grade' && (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((inst) => (
          <div
            key={inst.id}
            onClick={() => abrir(inst)}
            className="bg-white rounded-2xl border border-[#EFE7CE] p-5 shadow-sm hover:shadow-md hover:border-[#1807E5]/40 hover:bg-[#1807E5]/[0.05] transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{inst.nome}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {rotuloTipologia(inst.tipologia)}
                  {inst.cidade && ` · ${inst.cidade}`}
                </p>
              </div>
              <button
                onClick={(e) => excluir(e, inst)}
                className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                title="Excluir instalação"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {inst.responsavel && (
              <p className="mt-3 inline-block text-[11px] px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                {inst.responsavel}
              </p>
            )}

            <div className="mt-4">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs text-slate-500 tabular-nums">
                  {inst.anexados}/{inst.total} documentos
                </span>
                <span className="font-bold tabular-nums" style={{ fontFamily: FONTE, color: corDoProgresso(inst.percentual) }}>
                  {inst.percentual}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${inst.percentual}%`, background: corDoProgresso(inst.percentual) }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-[#1807E5] transition-colors">
              Ver documentos
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>
      )}

      {lista.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm text-slate-500">Nenhuma instalação cadastrada.</p>
          <button
            onClick={() => setCriando(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: TEMA.amarelo, color: TEMA.azul, borderRadius: RAIO_PILULA }}
          >
            <Plus className="h-4 w-4" />
            Criar a primeira
          </button>
        </div>
      )}

      {criando && <FormularioNovaInstalacao aoFechar={() => setCriando(false)} />}
    </div>
  );
}
