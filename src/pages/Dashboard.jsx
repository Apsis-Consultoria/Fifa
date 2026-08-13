import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2, FileClock, Building2, AlertTriangle, CheckCircle2, TrendingUp,
} from 'lucide-react';
import { useEstado, progresso } from '@/lib/store';
import { TIPOLOGIAS } from '@/lib/catalogo';
import Donut from '@/components/Donut';
import MapaSedes from '@/components/MapaSedes';
import {
  TEMA, FONTE, corDoProgresso, CLASSE_CARTAO, CLASSE_CARTAO_CLICAVEL, REALCE, REALCE_FORTE,
} from '@/lib/tema';

const rotuloTipologia = (id) => TIPOLOGIAS.find((t) => t.id === id)?.label || id;

const DIA = 86_400_000;

function Indicador({ icone: Icone, titulo, valor, detalhe, cor }) {
  return (
    <div className={`${CLASSE_CARTAO} px-4 py-3`}>
      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-medium uppercase tracking-wide">
        <Icone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cor }} />
        <span className="truncate">{titulo}</span>
      </div>
      <p className="mt-1 text-2xl font-bold text-slate-800 leading-tight" style={{ fontFamily: FONTE }}>
        {valor}
      </p>
      {detalhe && <p className="text-[11px] text-slate-400 truncate">{detalhe}</p>}
    </div>
  );
}

function Cartao({ titulo, descricao, children, classe = '' }) {
  return (
    <section className={`${classe} ${CLASSE_CARTAO} px-5 py-4 min-w-0`}>
      <h2 className="text-[13px] font-semibold text-slate-700">{titulo}</h2>
      {descricao && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{descricao}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Barra de conformidade com rotulo e contagem - o formato repetido nos cartoes. */
function Barra({ rotulo, complemento, anexados, total, percentual }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-0.5 gap-3">
        <span className="text-slate-600 font-medium truncate">
          {rotulo}
          {complemento && <span className="text-slate-400 font-normal"> · {complemento}</span>}
        </span>
        <span className="text-slate-500 tabular-nums flex-shrink-0">
          {anexados}/{total} · {percentual}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentual}%`, background: corDoProgresso(percentual) }}
        />
      </div>
    </div>
  );
}

/**
 * Agrupa documentos por uma chave da instalacao e devolve a conformidade de cada
 * grupo, do menor para o maior percentual.
 */
function agrupar(instalacoes, documentos, chave) {
  const mapa = new Map();

  instalacoes.forEach((inst) => {
    const nome = (typeof chave === 'function' ? chave(inst) : inst[chave]) || 'Não informado';
    const atual = mapa.get(nome) || { nome, total: 0, anexados: 0, instalacoes: 0 };
    const docs = documentos.filter((d) => d.instalacaoId === inst.id);
    atual.total += docs.length;
    atual.anexados += docs.filter((d) => d.arquivo).length;
    atual.instalacoes += 1;
    mapa.set(nome, atual);
  });

  return [...mapa.values()]
    .map((g) => ({ ...g, percentual: g.total ? Math.round((g.anexados / g.total) * 100) : 0 }))
    .sort((a, b) => a.percentual - b.percentual);
}

export default function Dashboard() {
  const estado = useEstado();
  const navigate = useNavigate();

  const painel = useMemo(() => {
    const geral = progresso(estado.documentos);

    const porInstalacao = estado.instalacoes
      .map((inst) => ({
        ...inst,
        ...progresso(estado.documentos.filter((d) => d.instalacaoId === inst.id)),
      }))
      .sort((a, b) => a.percentual - b.percentual);

    const porCidade = agrupar(estado.instalacoes, estado.documentos, 'cidade');
    const porTipologia = agrupar(estado.instalacoes, estado.documentos, (i) => rotuloTipologia(i.tipologia));
    const porResponsavel = agrupar(estado.instalacoes, estado.documentos, 'responsavel');

    // Gargalos: a MESMA exigencia pendente em varias instalacoes. E o que rende
    // acao conjunta - uma reuniao com o orgao resolve dez pendencias de uma vez.
    const gargalos = new Map();
    estado.documentos.forEach((d) => {
      if (d.arquivo) return;
      const atual = gargalos.get(d.nome) || { nome: d.nome, pendentes: 0, instalacoes: new Set() };
      atual.pendentes += 1;
      atual.instalacoes.add(d.instalacaoId);
      gargalos.set(d.nome, atual);
    });
    const maioresGargalos = [...gargalos.values()]
      .map((g) => ({ nome: g.nome, pendentes: g.pendentes, instalacoes: g.instalacoes.size }))
      .sort((a, b) => b.instalacoes - a.instalacoes || a.nome.localeCompare(b.nome))
      .slice(0, 6);

    // Ritmo: entregas por quinzena nas ultimas 12 semanas, para mostrar se o
    // projeto esta acelerando ou parado.
    const agora = Date.now();
    const janelas = Array.from({ length: 6 }, (_, i) => {
      const fim = agora - i * 14 * DIA;
      const inicio = fim - 14 * DIA;
      return { inicio, fim, entregues: 0 };
    }).reverse();

    let ultimos30 = 0;
    estado.documentos.forEach((d) => {
      const t = d.arquivo?.enviadoEm ? Date.parse(d.arquivo.enviadoEm) : null;
      if (!t) return;
      if (agora - t <= 30 * DIA) ultimos30 += 1;
      const janela = janelas.find((j) => t > j.inicio && t <= j.fim);
      if (janela) janela.entregues += 1;
    });

    const concluidas = porInstalacao.filter((i) => i.percentual === 100).length;
    const criticas = porInstalacao.filter((i) => i.percentual < 50);
    const comRessalva = estado.documentos.filter((d) => d.obs && !d.arquivo).length;

    return {
      geral, porInstalacao, porCidade, porTipologia, porResponsavel,
      maioresGargalos, janelas, ultimos30, concluidas, criticas, comRessalva,
    };
  }, [estado]);

  const {
    geral, porCidade, porTipologia, porResponsavel,
    maioresGargalos, janelas, ultimos30, concluidas, criticas, comRessalva,
  } = painel;

  const picoRitmo = Math.max(1, ...janelas.map((j) => j.entregues));

  return (
    <div className="p-6 lg:px-10 lg:py-7 max-w-[1400px]">
      <header className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: TEMA.azul }}>
          FIFA Women&apos;s World Cup Brasil 2027
        </p>
        <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: FONTE, color: TEMA.azulMarinho }}>
          Visão gerencial
        </h1>
        <p className="text-slate-500 mt-1 text-[13px]">
          Conformidade documental por instalação, consolidada a partir dos anexos entregues.
        </p>
        <div className="mt-3 h-[4px] w-24 rounded-full" style={{ background: TEMA.azul }} />
      </header>

      <section className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-5">
        <Indicador icone={Building2}     titulo="Instalações"  valor={painel.porInstalacao.length} detalhe="em acompanhamento"           cor={TEMA.azul} />
        <Indicador icone={FileCheck2}    titulo="Entregues"    valor={geral.anexados}              detalhe={`de ${geral.total} exigidos`} cor={TEMA.verde} />
        <Indicador icone={FileClock}     titulo="Pendentes"    valor={geral.pendentes}             detalhe="aguardando anexo"            cor={TEMA.amarelo} />
        <Indicador icone={TrendingUp}    titulo="Últimos 30 dias" valor={ultimos30}                detalhe="documentos entregues"        cor={TEMA.azul} />
        <Indicador icone={CheckCircle2}  titulo="Concluídas"   valor={concluidas}                  detalhe="instalações em 100%"         cor={TEMA.verde} />
        <Indicador icone={AlertTriangle} titulo="Abaixo de 50%" valor={criticas.length}            detalhe="instalações críticas"        cor={TEMA.critico} />
      </section>

      {criticas.length > 0 && (
        // O realce vai por evento, e nao por classe, para usar a constante REALCE do
        // tema em vez de repetir o azul diluido aqui.
        <button
          onClick={() => navigate(`/instalacoes/${criticas[0].id}`)}
          onMouseEnter={(e) => { e.currentTarget.style.background = REALCE; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
          className={`${CLASSE_CARTAO_CLICAVEL} mb-5 w-full px-5 py-3 flex items-center gap-4 text-left`}
        >
          <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: TEMA.critico }} />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-slate-700">
              Prioridade: {criticas[0].nome}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">
              Menor conformidade do portfólio, com {criticas[0].pendentes} documentos pendentes.
            </span>
          </span>
          <span className="font-bold tabular-nums flex-shrink-0" style={{ fontFamily: FONTE, color: corDoProgresso(criticas[0].percentual) }}>
            {criticas[0].percentual}%
          </span>
        </button>
      )}

      <div className="mb-5">
        <MapaSedes estado={estado} />
      </div>

      {/* Larguras diferentes, em doze colunas: a rosca e um numero so e nao precisa
          de um terco da tela, enquanto as listas de conformidade tem oito e seis
          linhas. Com tres colunas iguais, a rosca ficava numa caixa vazia demais e
          as listas espremidas. */}
      <div className="grid gap-4 lg:grid-cols-12 mb-5">
        <section className={`lg:col-span-3 min-w-0 ${CLASSE_CARTAO} px-5 py-4 flex flex-col items-center justify-center gap-4`}>
          <Donut
            tamanho={128}
            espessura={19}
            fatias={[
              { label: 'Entregues', valor: geral.anexados,  cor: TEMA.azul },
              { label: 'Pendentes', valor: geral.pendentes, cor: '#e2e8f0' },
            ]}
            centro={
              <>
                <span className="text-2xl font-bold" style={{ fontFamily: FONTE, color: TEMA.azulMarinho }}>
                  {geral.percentual}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">concluído</span>
              </>
            }
          />
          <div className="flex items-center gap-8 pb-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: TEMA.azul }} />
                <span className="text-xs font-medium text-slate-600">Entregues</span>
              </div>
              <p className="text-lg font-bold text-slate-800 ml-5 leading-tight" style={{ fontFamily: FONTE }}>{geral.anexados}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-slate-300" />
                <span className="text-xs font-medium text-slate-600">Pendentes</span>
              </div>
              <p className="text-lg font-bold text-slate-800 ml-5 leading-tight" style={{ fontFamily: FONTE }}>{geral.pendentes}</p>
            </div>
          </div>
        </section>

        <Cartao
          classe="lg:col-span-5"
          titulo="Conformidade por cidade"
          descricao="Cada cidade-sede soma o estádio e as instalações de apoio."
        >
          <div className="space-y-2">
            {porCidade.map((c) => (
              <Barra
                key={c.nome}
                rotulo={c.nome}
                complemento={`${c.instalacoes} instalaç${c.instalacoes > 1 ? 'ões' : 'ão'}`}
                anexados={c.anexados}
                total={c.total}
                percentual={c.percentual}
              />
            ))}
          </div>
        </Cartao>

        <Cartao
          classe="lg:col-span-4"
          titulo="Conformidade por tipologia"
          descricao="Cada tipologia exige um conjunto próprio de documentos, conforme o Anexo 2."
        >
          <div className="space-y-2">
            {porTipologia.map((t) => (
              <Barra
                key={t.nome}
                rotulo={t.nome}
                complemento={`${t.instalacoes} instalaç${t.instalacoes > 1 ? 'ões' : 'ão'}`}
                anexados={t.anexados}
                total={t.total}
                percentual={t.percentual}
              />
            ))}
          </div>
        </Cartao>

      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Cartao
          titulo="Conformidade por responsável"
          descricao="Quem responde pela entrega de cada conjunto de instalações."
        >
          <div className="space-y-2">
            {porResponsavel.map((r) => (
              <Barra
                key={r.nome}
                rotulo={r.nome}
                complemento={`${r.instalacoes} instalaç${r.instalacoes > 1 ? 'ões' : 'ão'}`}
                anexados={r.anexados}
                total={r.total}
                percentual={r.percentual}
              />
            ))}
          </div>
        </Cartao>

        <Cartao
          titulo="Exigências que mais se repetem em aberto"
          descricao="O mesmo documento pendente em várias instalações: resolver na origem derruba todas de uma vez."
        >
          <div className="divide-y divide-slate-100 -mx-2">
            {maioresGargalos.map((g) => (
              <div key={g.nome} className="flex items-center gap-4 px-2 py-2.5">
                <span className="text-sm text-slate-600 min-w-0 flex-1 truncate" title={g.nome}>
                  {g.nome}
                </span>
                <span
                  className="text-[11px] font-semibold tabular-nums flex-shrink-0 px-2.5 py-1 rounded-full"
                  style={{ background: REALCE_FORTE, color: TEMA.azul }}
                >
                  {g.instalacoes} instalaç{g.instalacoes > 1 ? 'ões' : 'ão'}
                </span>
              </div>
            ))}
            {maioresGargalos.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-slate-400">
                Nenhuma exigência pendente.
              </p>
            )}
          </div>
        </Cartao>

        <Cartao
          titulo="Ritmo de entrega"
          descricao="Documentos anexados por quinzena nas últimas 12 semanas."
        >
          <div className="flex items-end gap-3 h-32">
            {janelas.map((j, i) => (
              <div key={j.inicio} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <span className="text-[11px] font-semibold tabular-nums text-slate-500">{j.entregues}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(4, (j.entregues / picoRitmo) * 100)}%`,
                    background: i === janelas.length - 1 ? TEMA.azul : 'rgba(24,7,229,0.28)',
                  }}
                  title={`${j.entregues} documentos`}
                />
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {i === janelas.length - 1 ? 'atual' : `-${(janelas.length - 1 - i) * 2}sem`}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 leading-snug">
            {comRessalva} das exigências pendentes têm ressalva na planilha do Anexo 2
            (específicas de uma cidade ou aplicáveis só em certos casos).
          </p>
        </Cartao>
      </div>
    </div>
  );
}
