import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapaRuas, Satellite } from 'lucide-react';
import { progresso } from '@/lib/store';
import { iconeDaTipologia } from '@/components/IconeTipologia';
import IconeTipologia from '@/components/IconeTipologia';
import { TEMA, corDoProgresso, CLASSE_CARTAO, REALCE } from '@/lib/tema';

/**
 * Mapa das instalacoes do torneio.
 *
 * Mapa de verdade, com blocos do OpenStreetMap, no mesmo padrao do sistema de
 * auditoria de EPOs que o Filipe usou como referencia: o mapa preenche o retangulo
 * inteiro, ha alternancia Ruas / Satelite no canto, os pinos sao circulos com um
 * icone dentro e a lista das instalacoes fica na coluna da direita.
 *
 * O que veio de la e por que:
 *   - `scrollWheelZoom: false`. Rolar a pagina por cima do mapa nao aproxima. Era
 *     exatamente a reclamacao do Filipe na versao anterior, feita em SVG.
 *   - controle de zoom proprio do Leaflet, no canto superior esquerdo.
 *   - blocos de rua do OpenStreetMap e de satelite da Esri, os mesmos endereços.
 *
 * Consequencia a saber: os blocos vem da internet. O resto do prototipo funciona
 * offline (estado em localStorage, arquivos em IndexedDB); o mapa, nao. Sem rede,
 * aparecem os pinos sobre o fundo vazio do Leaflet.
 *
 * Antes daqui havia um contorno do Brasil desenhado em SVG, com as artes 3D dos
 * estadios como marcadores. Saiu inteiro: as artes ficavam estranhas em tamanho
 * pequeno e nunca pareciam do mesmo tamanho, por mais que se calibrasse.
 */

/** Diametro do pino, em pixels. */
const LADO_PINO = 38;

/** Enquadramento inicial: o Brasil inteiro. */
const CENTRO_BRASIL = [-15.2, -49.5];
const ZOOM_BRASIL = 4;

const CAMADAS = {
  ruas: {
    rotulo: 'Ruas',
    icone: MapaRuas,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    opcoes: { maxZoom: 18, attribution: '&copy; OpenStreetMap' },
  },
  satelite: {
    rotulo: 'Satélite',
    icone: Satellite,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    opcoes: { maxZoom: 18, attribution: 'Imagens: Esri' },
  },
};

/**
 * Pino de uma instalacao: circulo na cor da conformidade com o icone da tipologia.
 *
 * O icone e gerado como texto porque o Leaflet monta o marcador com HTML cru, fora
 * da arvore do React. `renderToStaticMarkup` deixa reaproveitar o mesmo componente
 * de icone que as listas usam, em vez de manter uma segunda copia dos desenhos.
 */
function iconeDoPino(inst, destacado) {
  const cor = corDoProgresso(inst.percentual);
  const Icone = iconeDaTipologia(inst.tipologia);
  // Sem forcar cor: os icones usam currentColor, e `.pino-mapa` define branco.
  const svg = renderToStaticMarkup(<Icone width={19} height={19} strokeWidth={2} />);

  return L.divIcon({
    className: '',
    html:
      `<div class="pino-mapa${destacado ? ' pino-destacado' : ''}" ` +
      `style="background:${cor}">${svg}</div>`,
    iconSize: [LADO_PINO, LADO_PINO],
    iconAnchor: [LADO_PINO / 2, LADO_PINO / 2],
    popupAnchor: [0, -LADO_PINO / 2 + 2],
  });
}

/** Conteudo do balao. HTML cru: o Leaflet nao renderiza React aqui dentro. */
function balaoDe(inst) {
  const cor = corDoProgresso(inst.percentual);
  const aproximada = inst.aproximada
    ? '<p class="balao-obs">Posição aproximada: o endereço exato não está no cadastro.</p>'
    : '';
  return (
    `<p class="balao-nome">${inst.nome}</p>` +
    `<p class="balao-local">${inst.cidade || 'Local não informado'}</p>` +
    `<div class="balao-linha">` +
      `<strong style="color:${cor}">${inst.percentual}%</strong>` +
      `<span>${inst.anexados} de ${inst.total} documentos</span>` +
    `</div>` +
    aproximada +
    `<button type="button" class="balao-botao" data-ir="${inst.id}">Ver documentação</button>`
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
      className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors rounded-[10px]"
      style={{ background: destacado ? REALCE : 'transparent' }}
    >
      {/* O icone repete o do pino: o mesmo tipo de instalacao, o mesmo desenho */}
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: cor }}
      >
        <IconeTipologia tipologia={inst.tipologia} className="h-3.5 w-3.5 text-white" />
      </span>

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

export default function MapaSedes({ estado }) {
  const navigate = useNavigate();
  const [destacado, setDestacado] = useState(null);
  const [camada, setCamada] = useState('ruas');

  const telaRef = useRef(null);
  const mapaRef = useRef(null);
  const camadaAtualRef = useRef(null);
  const marcadoresRef = useRef(new Map());

  const { comCoordenada, estadios, outras } = useMemo(() => {
    const comProgresso = (i) => ({
      ...i,
      ...progresso(estado.documentos.filter((d) => d.instalacaoId === i.id)),
    });

    const todas = estado.instalacoes.map(comProgresso);
    const porConformidade = (a, b) => a.percentual - b.percentual;

    return {
      comCoordenada: todas.filter((i) => i.lat != null && i.lon != null),
      // Pior conformidade primeiro: a lista serve para achar o problema, nao para
      // enumerar instalacoes em ordem alfabetica.
      estadios: todas.filter((i) => i.tipologia === 'estadio').sort(porConformidade),
      outras: todas.filter((i) => i.tipologia !== 'estadio').sort(porConformidade),
    };
  }, [estado]);

  // ── o mapa, criado uma vez ────────────────────────────────────────────────
  useEffect(() => {
    if (!telaRef.current || mapaRef.current) return;

    const mapa = L.map(telaRef.current, {
      center: CENTRO_BRASIL,
      zoom: ZOOM_BRASIL,
      // A roda do mouse rola a pagina, nao aproxima o mapa. Zoom pelos botoes.
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });
    mapaRef.current = mapa;

    // O balao e HTML cru, entao a navegacao do React Router entra por um ouvinte.
    mapa.getContainer().addEventListener('click', (ev) => {
      const alvo = ev.target.closest('[data-ir]');
      if (alvo) navigate(`/instalacoes/${alvo.getAttribute('data-ir')}`);
    });

    // O Leaflet calcula o tamanho uma vez, na criacao, e nao percebe sozinho quando
    // a coluna muda de largura - a camada de blocos fica do tamanho antigo e sobra
    // faixa cinza na borda. O observador avisa a cada mudanca de caixa.
    const observador = new ResizeObserver(() => mapa.invalidateSize());
    observador.observe(telaRef.current);

    return () => {
      observador.disconnect();
      mapa.remove();
      mapaRef.current = null;
      marcadoresRef.current.clear();
    };
  }, [navigate]);

  // ── camada de fundo ───────────────────────────────────────────────────────
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    if (camadaAtualRef.current) mapa.removeLayer(camadaAtualRef.current);
    const { url, opcoes } = CAMADAS[camada];
    camadaAtualRef.current = L.tileLayer(url, opcoes).addTo(mapa);
    // Os blocos ficam sob os pinos, sempre.
    camadaAtualRef.current.bringToBack();
  }, [camada]);

  // ── pinos ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    marcadoresRef.current.forEach((m) => m.remove());
    marcadoresRef.current.clear();

    comCoordenada.forEach((inst) => {
      const marcador = L.marker([inst.lat, inst.lon], {
        icon: iconeDoPino(inst, false),
        title: `${inst.nome} - ${inst.percentual}%`,
        riseOnHover: true,
      })
        .bindPopup(balaoDe(inst), { closeButton: true, minWidth: 210 })
        .on('mouseover', () => setDestacado(inst.id))
        .on('mouseout', () => setDestacado(null))
        .addTo(mapa);

      marcadoresRef.current.set(inst.id, marcador);
    });

    if (comCoordenada.length) {
      mapa.fitBounds(comCoordenada.map((i) => [i.lat, i.lon]), {
        padding: [44, 44],
        maxZoom: 7,
      });
    }
  }, [comCoordenada]);

  // ── realce vindo da lista ─────────────────────────────────────────────────
  useEffect(() => {
    marcadoresRef.current.forEach((marcador, id) => {
      const inst = comCoordenada.find((i) => i.id === id);
      if (inst) marcador.setIcon(iconeDoPino(inst, id === destacado));
    });
  }, [destacado, comCoordenada]);

  const irPara = (i) => navigate(`/instalacoes/${i.id}`);

  return (
    <section className={`${CLASSE_CARTAO} overflow-hidden`}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-slate-800">Instalações no Brasil</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cor do pino pela conformidade documental. Clique em uma instalação para ver os documentos.
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

      <div className="grade-mapa overflow-hidden">
        <div className="relative min-w-0">
          {/* Alternancia de fundo, no canto do mapa - acima dos controles do Leaflet */}
          <div className="absolute top-3 right-3 z-[500] flex items-center gap-1 p-1 bg-white rounded-full border border-[#E2E8F0] shadow-sm">
            {Object.entries(CAMADAS).map(([id, { rotulo, icone: Icone }]) => {
              const ativo = camada === id;
              return (
                <button
                  key={id}
                  onClick={() => setCamada(id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors"
                  style={{
                    background: ativo ? TEMA.azul : 'transparent',
                    color: ativo ? '#FFFFFF' : TEMA.textoSuave,
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

          <div ref={telaRef} className="tela-mapa" />
        </div>

        {/* Lista lateral: TODAS as instalacoes, da menos a mais conforme */}
        <aside className="border-t lg:border-t-0 lg:border-l border-slate-100 p-3 min-w-0 overflow-x-hidden overflow-y-auto">
          <p className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-400">
            Estádios de competição
          </p>
          <div className="lista-instalacoes">
            {estadios.map((inst) => (
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
              <div className="lista-instalacoes">
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
