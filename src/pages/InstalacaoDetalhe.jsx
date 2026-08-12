import { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Upload, Download, Trash2, X, Search,
  CheckCircle2, Circle, Paperclip, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useEstado, getInstalacao, documentosDe, progresso,
  criarDocumento, removerDocumento, anexar, desanexar,
} from '@/lib/store';
import { TIPOLOGIAS } from '@/lib/catalogo';
import { baixarArquivo, formatarTamanho } from '@/lib/files';
import Donut from '@/components/Donut';
import { TEMA, FONTE, RAIO_PILULA } from '@/lib/tema';

const CAMPO =
  'w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 ' +
  'placeholder:text-slate-400 transition-colors focus:outline-none focus:border-[#1807E5] ' +
  'focus:ring-2 focus:ring-[#1807E5]/20';

const rotuloTipologia = (id) => TIPOLOGIAS.find((t) => t.id === id)?.label || id;

/** Linha do checklist: um documento exigido, com a area de anexo. */
function LinhaDocumento({ doc, aoAnexar, aoRemoverAnexo, aoExcluir }) {
  const inputRef = useRef(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function receber(file) {
    if (!file) return;
    setEnviando(true);
    try {
      await aoAnexar(doc.id, file);
      toast.success(`"${file.name}" anexado.`);
    } catch {
      toast.error('Nao foi possivel anexar o arquivo.');
    } finally {
      setEnviando(false);
    }
  }

  async function baixar() {
    if (doc.arquivo?.demo) {
      toast.info('Arquivo de demonstração: o registro existe, mas sem conteúdo real.');
      return;
    }
    const ok = await baixarArquivo(doc.arquivo);
    if (!ok) toast.error('Conteúdo do arquivo não encontrado.');
  }

  const anexado = !!doc.arquivo;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!anexado) setArrastando(true); }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        if (!anexado) receber(e.dataTransfer.files?.[0]);
      }}
      className={`px-5 py-3.5 flex items-center gap-4 transition-colors ${
        arrastando ? 'ring-2 ring-inset' : 'hover:bg-[#1807E5]/[0.05]'
      }`}
      style={arrastando ? { background: 'rgba(255,208,51,0.18)', boxShadow: `inset 0 0 0 2px ${TEMA.amarelo}` } : undefined}
    >
      {anexado
        ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: TEMA.verde }} />
        : <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />}

      <div className="min-w-0 flex-1">
        <p className={`text-sm truncate ${anexado ? 'text-slate-700' : 'text-slate-600'}`}>
          {doc.nome}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {doc.obs && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
              {doc.obs}
            </span>
          )}
          {doc.origem === 'avulso' && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
              solicitação avulsa
            </span>
          )}
          {anexado && (
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1 min-w-0">
              <Paperclip className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{doc.arquivo.nome}</span>
              <span className="flex-shrink-0">· {formatarTamanho(doc.arquivo.tamanho)}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {anexado ? (
          <>
            <button onClick={baixar} title="Baixar" className="p-2 rounded-lg text-slate-400 hover:text-[#1807E5] hover:bg-[#1807E5]/[0.07] transition-colors">
              <Download className="h-4 w-4" />
            </button>
            <button onClick={() => aoRemoverAnexo(doc.id)} title="Remover anexo" className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50 transition-opacity hover:opacity-80"
            style={{ background: TEMA.amarelo, color: TEMA.azul, borderRadius: RAIO_PILULA }}
          >
            <Upload className="h-3.5 w-3.5" />
            {enviando ? 'Enviando...' : 'Anexar'}
          </button>
        )}

        {doc.origem === 'avulso' && (
          <button onClick={() => aoExcluir(doc.id)} title="Excluir solicitação" className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => { receber(e.target.files?.[0]); e.target.value = ''; }}
      />
    </div>
  );
}

function FormularioNovoDocumento({ instalacaoId, aoFechar }) {
  const [nome, setNome] = useState('');
  const [obs, setObs] = useState('');

  function salvar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    criarDocumento({ instalacaoId, nome, obs });
    toast.success('Solicitação de documento criada.');
    aoFechar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: FONTE }}>
              Nova solicitação de documento
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Para exigências fora do catálogo padrão da tipologia.
            </p>
          </div>
          <button onClick={aoFechar} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={salvar} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Documento</label>
            <input
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Autorização especial da Prefeitura"
              className={CAMPO}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Descrição breve <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              placeholder="Contexto, órgão emissor ou condicionantes."
              className={`${CAMPO} resize-none`}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={aoFechar} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nome.trim()}
              className="px-5 py-2.5 text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ background: TEMA.amarelo, color: TEMA.azul, borderRadius: RAIO_PILULA }}
            >
              Criar solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InstalacaoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const estado = useEstado();

  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos'); // todos | pendentes | entregues
  const [criando, setCriando] = useState(false);

  const instalacao = getInstalacao(id);
  const docs = useMemo(() => documentosDe(id), [estado, id]);
  const prog = progresso(docs);

  const visiveis = docs.filter((d) => {
    if (filtro === 'pendentes' && d.arquivo) return false;
    if (filtro === 'entregues' && !d.arquivo) return false;
    if (busca.trim() && !d.nome.toLowerCase().includes(busca.trim().toLowerCase())) return false;
    return true;
  });

  if (!instalacao) {
    return (
      <div className="p-10">
        <p className="text-slate-500">Instalação não encontrada.</p>
        <Link to="/instalacoes" className="text-sm underline mt-2 inline-block" style={{ color: TEMA.azul }}>
          Voltar para instalações
        </Link>
      </div>
    );
  }

  const ABAS = [
    { id: 'todos',     label: `Todos (${docs.length})` },
    { id: 'pendentes', label: `Pendentes (${prog.pendentes})` },
    { id: 'entregues', label: `Entregues (${prog.anexados})` },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-[1400px]">
      <button
        onClick={() => navigate('/instalacoes')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 px-3 py-1.5 -ml-3 rounded-full transition-colors hover:text-[#1807E5] hover:bg-[#1807E5]/[0.07] mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Instalações
      </button>

      <header className="bg-white rounded-2xl border border-[#EFE7CE] shadow-sm p-6 mb-6 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold" style={{ fontFamily: FONTE, color: TEMA.azulMarinho }}>
            {instalacao.nome}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[11px] px-2.5 py-1 font-medium" style={{ background: 'rgba(24,7,229,0.08)', color: TEMA.azul, borderRadius: RAIO_PILULA }}>
              {rotuloTipologia(instalacao.tipologia)}
            </span>
            {instalacao.cidade && (
              <span className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-600" style={{ borderRadius: RAIO_PILULA }}>
                {instalacao.cidade}
              </span>
            )}
            {instalacao.responsavel && (
              <span className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-600" style={{ borderRadius: RAIO_PILULA }}>
                Responsável: {instalacao.responsavel}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {prog.anexados} de {prog.total} documentos entregues · {prog.pendentes} pendentes
          </p>
        </div>

        <Donut
          tamanho={130}
          espessura={18}
          fatias={[
            { label: 'Entregues', valor: prog.anexados,  cor: TEMA.azul },
            { label: 'Pendentes', valor: prog.pendentes, cor: '#cbd5e1' },
          ]}
          centro={
            <>
              <span className="text-2xl font-bold" style={{ fontFamily: FONTE, color: TEMA.azulMarinho }}>
                {prog.percentual}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">concluído</span>
            </>
          }
        />
      </header>

      <div className="bg-white rounded-2xl border border-[#EFE7CE] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex gap-1 flex-shrink-0">
            {ABAS.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setFiltro(aba.id)}
                className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  filtro === aba.id ? 'font-semibold' : 'text-slate-500 hover:bg-[#1807E5]/[0.07] hover:text-[#1807E5]'
                }`}
                style={{
                  borderRadius: RAIO_PILULA,
                  background: filtro === aba.id ? TEMA.azul : undefined,
                  color: filtro === aba.id ? '#FFFFFF' : undefined,
                }}
              >
                {aba.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar documento..."
              className={`${CAMPO} pl-9 py-2`}
            />
          </div>

          <button
            onClick={() => setCriando(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ background: TEMA.amarelo, color: TEMA.azul, borderRadius: RAIO_PILULA }}
          >
            <Plus className="h-4 w-4" />
            Nova solicitação
          </button>
        </div>

        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <FileText className="h-3.5 w-3.5" />
          Arraste um arquivo sobre a linha do documento para anexar.
        </div>

        <div className="divide-y divide-slate-100">
          {visiveis.map((doc) => (
            <LinhaDocumento
              key={doc.id}
              doc={doc}
              aoAnexar={anexar}
              aoRemoverAnexo={desanexar}
              aoExcluir={removerDocumento}
            />
          ))}

          {visiveis.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-slate-400">
              Nenhum documento corresponde ao filtro.
            </p>
          )}
        </div>
      </div>

      {criando && (
        <FormularioNovoDocumento instalacaoId={id} aoFechar={() => setCriando(false)} />
      )}
    </div>
  );
}
