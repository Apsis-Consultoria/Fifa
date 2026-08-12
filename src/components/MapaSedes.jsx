import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import { progresso } from '@/lib/store';
import { VIEWBOX, ESTADOS, projetar, paraPercentual } from '@/lib/mapaBrasil';
import { SEDES } from '@/lib/sedes';
import { desamontoar } from '@/lib/declutter';
import { TEMA, corDoProgresso } from '@/lib/tema';

// Largura de referencia do mapa. Os marcadores sao dimensionados em pixels contra
// ela e depois convertidos para percentual do quadro, entao crescem junto com o
// mapa: a mancha de cada estadio no Brasil e sempre a mesma, em qualquer tela.
const MAPA_PX = 760;

/**
 * Area em pixels que toda arte de estadio ocupa na tela.
 *
 * As artes vem da FIFA em proporcoes bem diferentes - de 1,14 (Maracana) a 2,03
 * (Fonte Nova) de largura por altura. Fixar so a largura, como era antes, deixava
 * umas com 27 px de altura e outras com 41, e no mapa isso lia como estadios de
 * tamanhos diferentes. Aqui o que se iguala e a AREA: cada arte recebe
 * largura x altura = AREA_ALVO, mantida a sua proporcao. O ajuste fino por desenho
 * (o cenario em volta do estadio varia muito) vem de `arte.escala`, em sedes.js.
 */
const AREA_ALVO = 2600;

// A arte de cada sede vem de sedes.js, nao do estado guardado: e dado de
// apresentacao, e guardar no localStorage obrigaria a versionar o estado a cada
// ajuste de desenho.
const ARTE_POR_IMAGEM = new Map(SEDES.map((s) => [s.imagem, s.arte]));

/** Largura e altura do marcador de uma sede, em % do lado do mapa. */
function medirCartao(inst) {
  const { proporcao = 1.25, escala = 1 } = ARTE_POR_IMAGEM.get(inst.imagem) || {};
  return {
    l: (Math.sqrt(AREA_ALVO * proporcao) * escala / MAPA_PX) * 100,
    a: (Math.sqrt(AREA_ALVO / proporcao) * escala / MAPA_PX) * 100,
  };
}

// Caixa usada para afastar marcadores sobrepostos, em % do lado do mapa. E a maior
// das caixas: separar pelo maior evita que o vizinho grande cubra o pequeno.
const CARTAO = {
  largura: (98 / MAPA_PX) * 100,
  altura: (54 / MAPA_PX) * 100,
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 6;
const PASSO_ZOOM = 1.5;

/** Fundo do realce, o mesmo em toda a aplicacao: o azul do torneio bem diluido. */
const REALCE = 'rgba(24,7,229,0.07)';

const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

/** Converte '#RRGGBB' em rgba() - as cores de status do tema sao hexadecimais. */
function comAlfa(hex, alfa) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}

/**
 * Marcador de um estadio. Cresce com o zoom, porque vive na camada transformada.
 *
 * Sem rotulo: quem nomeia os estadios e a lista ao lado do mapa. Assim o mapa fica
 * limpo e os nomes ficam legiveis sem depender do zoom.
 *
 * Sem nenhum enfeite: nem circulo do ponto exato, nem bolinha, nem barra de
 * progresso. Quem carrega a conformidade e o proprio estado pintado embaixo.
 */
function PinEstadio({ inst, aoClicar, destacado, aoEntrar, aoSair }) {
  const { l, a } = medirCartao(inst);

  return (
    <button
      onClick={() => aoClicar(inst)}
      onMouseEnter={() => aoEntrar(inst.id)}
      onMouseLeave={aoSair}
      className="absolute focus:outline-none"
      style={{
        left: `${inst.cx}%`,
        top: `${inst.cy}%`,
        width: `${l}%`,
        height: `${a}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: destacado ? 40 : 10,
      }}
      title={`${inst.nome} - ${inst.cidade} (${inst.percentual}%)`}
    >
      <div
        className="relative w-full h-full transition-transform duration-150"
        style={{ transformOrigin: 'center bottom', transform: destacado ? 'scale(1.3)' : 'none' }}
      >
        <img
          src={inst.imagem}
          alt={inst.nome}
          className="w-full h-full object-contain drop-shadow"
          draggable={false}
        />
      </div>
    </button>
  );
}

/** Linha da lista lateral: nomeia a instalacao e mostra a conformidade. */
function ItemLista({ inst, destacado, aoClicar, aoEntrar, aoSair }) {
  const cor = corDoProgresso(inst.percentual);

  return (
    <button
      onClick={() => aoClicar(inst)}
      onMouseEnter={() => aoEntrar(inst.id)}
      onMouseLeave={aoSair}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
      style={{
        borderRadius: 10,
        background: destacado ? REALCE : 'transparent',
      }}
    >
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cor }} />

      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-medium text-slate-700 truncate">{inst.nome}</span>
        <span className="block text-[10px] text-slate-400 truncate">
          {inst.cidade}
          {' · '}
          <span className="tabular-nums">{inst.anexados}/{inst.total} docs</span>
        </span>
      </span>

      <span className="text-[11px] font-bold tabular-nums flex-shrink-0" style={{ color: cor }}>
        {inst.percentual}%
      </span>
    </button>
  );
}

function BotaoZoom({ children, onClick, titulo, desabilitado }) {
  return (
    <button
      onClick={onClick}
      title={titulo}
      disabled={desabilitado}
      className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 shadow-sm transition-colors hover:text-[#1807E5] hover:border-[#1807E5]/40 hover:bg-[#1807E5]/[0.07] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:hover:border-slate-200"
      style={{ borderRadius: 8 }}
    >
      {children}
    </button>
  );
}

/**
 * Mapa das cidades-sede: os estadios de competicao sobre o contorno do Brasil.
 *
 * A aproximacao e SO pelos botoes + e -. A roda do mouse chegou a dar zoom, mas
 * quem rolava a pagina passava por cima do mapa e aproximava sem querer - o mapa
 * "cortava" sozinho. Rolar agora rola a pagina, como em qualquer outra secao.
 * Aproximado, o mapa aceita arraste para navegar.
 *
 * Recebe o estado inteiro para calcular o progresso com o MESMO calculo da visao
 * gerencial, para os dois nunca divergirem.
 */
export default function MapaSedes({ estado }) {
  const navigate = useNavigate();
  const [destacado, setDestacado] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [arrastando, setArrastando] = useState(false);

  const areaRef = useRef(null);
  const arrasteRef = useRef(null);

  const { estadios, outras, porUf } = useMemo(() => {
    const comProgresso = (i) => ({
      ...i,
      ...progresso(estado.documentos.filter((d) => d.instalacaoId === i.id)),
    });

    const base = estado.instalacoes
      .filter((i) => i.lat != null && i.lon != null)
      .map((i) => {
        const { x, y } = projetar(i.lat, i.lon);
        return { ...comProgresso(i), x: paraPercentual(x), y: paraPercentual(y) };
      });

    const porId = new Map(desamontoar(base, CARTAO).map((p) => [p.id, p]));

    const estadios = base.map((i) => ({ ...i, ...porId.get(i.id) }));

    // A conformidade do estadio pinta o estado inteiro - e assim que o status
    // aparece no mapa, sem nenhuma marca sobre o desenho.
    const porUf = new Map(estadios.filter((i) => i.uf).map((i) => [i.uf, i]));

    return {
      estadios,
      porUf,
      outras: estado.instalacoes
        .filter((i) => i.lat == null || i.lon == null)
        .map(comProgresso)
        .sort((a, b) => a.percentual - b.percentual),
    };
  }, [estado]);

  /** Mantem o mapa preso as bordas da area visivel. */
  function ajustarPan(prox, k) {
    const el = areaRef.current;
    if (!el) return prox;
    const { width: L, height: A } = el.getBoundingClientRect();
    const limiteX = Math.max(0, L * k - L);
    const limiteY = Math.max(0, A * k - A);
    return { x: limitar(prox.x, -limiteX, 0), y: limitar(prox.y, -limiteY, 0) };
  }

  /** Zoom ancorado no centro da area - a origem e sempre um botao. */
  function aplicarZoom(novoZoom) {
    const el = areaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const k = limitar(novoZoom, ZOOM_MIN, ZOOM_MAX);
    const ax = r.width / 2;
    const ay = r.height / 2;

    // Mantem no centro o mesmo ponto do mapa: pan' = a - (a - pan) * k'/k
    setPan((atual) =>
      ajustarPan(
        { x: ax - ((ax - atual.x) * k) / zoom, y: ay - ((ay - atual.y) * k) / zoom },
        k,
      ),
    );
    setZoom(k);
  }

  function iniciarArraste(e) {
    if (zoom === 1) return;
    arrasteRef.current = { x: e.clientX, y: e.clientY, pan };
    setArrastando(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function moverArraste(e) {
    const a = arrasteRef.current;
    if (!a) return;
    setPan(ajustarPan({ x: a.pan.x + (e.clientX - a.x), y: a.pan.y + (e.clientY - a.y) }, zoom));
  }

  function encerrarArraste() {
    arrasteRef.current = null;
    setArrastando(false);
  }

  function reiniciar() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  // Pior conformidade primeiro: a lista serve para achar o problema, nao para
  // enumerar cidades em ordem alfabetica.
  const porConformidade = useMemo(
    () => [...estadios].sort((a, b) => a.percentual - b.percentual),
    [estadios],
  );

  const irPara = (i) => navigate(`/instalacoes/${i.id}`);

  return (
    <section className="bg-white rounded-2xl border border-[#EFE7CE] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-slate-800">Cidades-sede e instalações</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Use os botões + e - para aproximar. Clique em uma instalação para ver a documentação.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          {[
            { cor: TEMA.verde,   rotulo: '80% ou mais' },
            { cor: TEMA.amarelo, rotulo: '50% a 79%' },
            { cor: TEMA.critico, rotulo: 'abaixo de 50%' },
          ].map(({ cor, rotulo }) => (
            <span key={rotulo} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: cor }} />
              {rotulo}
            </span>
          ))}
        </div>
      </div>

      {/* A largura da coluna do mapa vem da altura da janela (ver .grade-mapa, no
          index.css) e a lista fica com a sobra: o mapa cabe na tela sem deixar
          faixa vazia dos lados. */}
      <div className="grade-mapa">
        <div className="relative px-6 py-6" style={{ background: 'linear-gradient(180deg, #FFFDF6 0%, #FFFBEB 100%)' }}>
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
            <BotaoZoom titulo="Aproximar" onClick={() => aplicarZoom(zoom * PASSO_ZOOM)} desabilitado={zoom >= ZOOM_MAX}>
              <Plus className="h-4 w-4" />
            </BotaoZoom>
            <BotaoZoom titulo="Afastar" onClick={() => aplicarZoom(zoom / PASSO_ZOOM)} desabilitado={zoom <= ZOOM_MIN}>
              <Minus className="h-4 w-4" />
            </BotaoZoom>
            <BotaoZoom titulo="Ver o Brasil inteiro" onClick={reiniciar} desabilitado={zoom === 1 && pan.x === 0 && pan.y === 0}>
              <Maximize2 className="h-3.5 w-3.5" />
            </BotaoZoom>
          </div>

          {zoom > 1 && (
            <span
              className="absolute top-4 left-6 z-20 text-[10px] font-semibold px-2 py-1 bg-white border border-slate-200 text-slate-500 shadow-sm rounded-full"
            >
              {zoom.toFixed(1)}x
            </span>
          )}

          <div
            ref={areaRef}
            onPointerDown={iniciarArraste}
            onPointerMove={moverArraste}
            onPointerUp={encerrarArraste}
            onPointerCancel={encerrarArraste}
            className="relative w-full overflow-hidden touch-none"
            style={{
              // Quadrado, ocupando a coluna inteira. Quem limita a altura e a
              // largura da coluna, que sai da altura da janela.
              aspectRatio: '1 / 1',
              cursor: zoom === 1 ? 'default' : arrastando ? 'grabbing' : 'grab',
            }}
          >
            {/* Camada transformada: mapa e marcadores crescem juntos */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: arrastando ? 'none' : 'transform 160ms ease-out',
              }}
            >
              <svg viewBox={VIEWBOX} className="absolute inset-0 w-full h-full">
                {ESTADOS.map((e) => {
                  const sede = porUf.get(e.sigla);
                  const cor = sede ? corDoProgresso(sede.percentual) : null;
                  const realcado = sede && destacado === sede.id;
                  return (
                    <path
                      key={e.sigla}
                      d={e.d}
                      fill={cor ? comAlfa(cor, realcado ? 0.42 : 0.24) : 'rgba(9,27,63,0.06)'}
                      stroke={cor || 'rgba(9,27,63,0.22)'}
                      strokeWidth={cor ? (realcado ? 2.4 : 1.6) : 0.9}
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      className="transition-[fill] duration-150"
                    >
                      <title>
                        {sede ? `${e.nome} - ${sede.nome}: ${sede.percentual}%` : e.nome}
                      </title>
                    </path>
                  );
                })}
              </svg>

              {estadios.map((inst) => (
                <PinEstadio
                  key={inst.id}
                  inst={inst}
                  destacado={destacado === inst.id}
                  aoEntrar={setDestacado}
                  aoSair={() => setDestacado(null)}
                  aoClicar={irPara}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lista lateral: TODAS as instalacoes, da menos a mais conforme. Fica aqui,
            ao lado do mapa, em vez de repetida numa tabela abaixo dele. */}
        <aside className="border-t lg:border-t-0 lg:border-l border-slate-100 p-3">
          <p className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-400">
            Estádios de competição
          </p>
          <div className="space-y-0.5 xl:grid xl:grid-cols-2 xl:gap-x-2 xl:space-y-0">
            {porConformidade.map((inst) => (
              <ItemLista
                key={inst.id}
                inst={inst}
                destacado={destacado === inst.id}
                aoEntrar={setDestacado}
                aoSair={() => setDestacado(null)}
                aoClicar={irPara}
              />
            ))}
          </div>

          {outras.length > 0 && (
            <>
              <p className="px-3 pt-4 pb-2 text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-400">
                Outras instalações
              </p>
              <div className="space-y-0.5 xl:grid xl:grid-cols-2 xl:gap-x-2 xl:space-y-0">
                {outras.map((inst) => (
                  <ItemLista
                    key={inst.id}
                    inst={inst}
                    destacado={destacado === inst.id}
                    aoEntrar={setDestacado}
                    aoSair={() => setDestacado(null)}
                    aoClicar={irPara}
                  />
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
