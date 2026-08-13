import { useLayoutEffect, useRef } from 'react';
import { TEMA, FONTE, MARCA } from '@/lib/tema';
import { comBase } from '@/lib/assets';

/**
 * Layout de login no padrao do portal APSIS, na identidade da Copa.
 *
 * Esquerda: a arte oficial do torneio, com o logotipo no canto superior.
 * Direita: painel BRANCO com borda esquerda curva (clip-path), a marca do torneio
 *   sem letreiro e a area de login (children). No mobile, empilha.
 *
 * Proporcoes IDENTICAS as do portal-apsis: grid 64%/36%, painel w-[37%] com
 * ellipse(85% 160% at 93% 50%), e a linha amarela acompanhando a curva.
 *
 * A logica de autenticacao NAO vive aqui - os forms entram como children.
 *
 * ── A ARTE DE FUNDO ──────────────────────────────────────────────────────────
 * Uma imagem so, fixa. Antes eram cinco fotos em revezamento; o Filipe pediu
 * estatica.
 *
 * A faixa da foto para em 76% da largura (ver `.faixa-fotos` no index.css), pouco
 * depois de onde o painel comeca a cobrir (a elipse chega a 66%). Sem essa folga,
 * o recorte do `object-fit: cover` nao sobra quase nada na horizontal e a arte -
 * que tem a taca e o letreiro no centro - ficaria com metade escondida atras do
 * painel. Com a faixa, o centro da imagem cai a ~38% da tela, bem a esquerda dele.
 *
 * Nao ha mais texto sobre a foto: o titulo do sistema foi para o painel branco.
 * Por isso os gradientes de escurecimento sao leves - eles existiam para dar
 * contraste ao texto, e agora so assentam a arte.
 */

// 2465x1536 em WebP (140 KB): a primeira versao tinha 826x465 e chegava esticada a
// mais de 1900px de largura na tela, visivelmente pixelada. O original sem perda
// esta em assets-fonte/hero-fwwc2027.png.
export const FOTO = '/login-copa/hero-fwwc2027.webp';

/**
 * Onde fica o centro do que se ve na arte, em fracao da largura do arquivo.
 *
 * Medido, nao chutado: pesando o quanto cada pixel se afasta do azul de fundo, a
 * taca e o letreiro tem centro em 55,5% - a arte NAO e simetrica. Foi por isso que
 * centrar a imagem "no olho" sempre deixava o conteudo puxado para a direita.
 */
const FOCO = 0.555;

/**
 * Ate onde a tela e realmente visivel, em fracao da largura, no desktop.
 * O painel de login cobre a partir dai (a elipse chega a 66%).
 */
const ATE_ONDE_SE_VE = 0.66;

/** Grafismo do torneio - base sob as fotos, e fundo inteiro enquanto nao houver fotos. */
function FundoGrafico() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="copa-fundo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={TEMA.azul} />
          <stop offset="60%"  stopColor="#1304B8" />
          <stop offset="100%" stopColor={TEMA.azulMarinho} />
        </linearGradient>
        <pattern id="copa-malha" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0H0V64" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.09" />
        </pattern>
      </defs>

      <rect width="1600" height="900" fill="url(#copa-fundo)" />
      <rect width="1600" height="900" fill="url(#copa-malha)" />

      {/* Geometria do campo */}
      <g fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.16">
        <line x1="800" y1="0" x2="800" y2="900" />
        <circle cx="800" cy="450" r="150" />
        <rect x="0"    y="280" width="170" height="340" />
        <rect x="1430" y="280" width="170" height="340" />
      </g>

      {/* Losango da bandeira */}
      <g fill="none">
        <path d="M800 170 L1080 450 L800 730 L520 450 Z" stroke={TEMA.amarelo} strokeWidth="2.5" opacity="0.5" />
        <path d="M800 265 L985 450 L800 635 L615 450 Z"  stroke={TEMA.verde}   strokeWidth="2"   opacity="0.45" />
      </g>
    </svg>
  );
}

export default function CopaLoginLayout({
  children,
  foto = FOTO,
  subheadline = 'Copa do Mundo Feminina da FIFA Brasil 2027',
  copyright = '© 2026 APSIS Consultoria. Todos os direitos reservados.',
}) {
  const faixaRef = useRef(null);
  const fotoRef = useRef(null);

  /**
   * Encaixa a arte de modo que o centro do conteudo caia no meio do espaco que
   * sobra a esquerda do painel de login.
   *
   * Nao da para fazer isso com `object-position`: ele so distribui o recorte que
   * o `cover` ja definiu, e nessa proporcao de tela o recorte disponivel era menor
   * do que o deslocamento necessario - o conteudo empacava antes de chegar ao
   * centro. Aqui a imagem e desenhada na altura da faixa, com a largura que a
   * proporcao pedir, e a conta diz de onde ela comeca. Pode comecar em negativo:
   * e o mesmo que recortar a esquerda.
   */
  function enquadrar() {
    const faixa = faixaRef.current;
    const foto = fotoRef.current;
    if (!faixa || !foto || !foto.naturalWidth) return;

    const { width: larguraFaixa, height: altura } = faixa.getBoundingClientRect();
    const desktop = window.innerWidth >= 1024;
    const proporcao = foto.naturalWidth / foto.naturalHeight;

    // A imagem ocupa a altura da faixa e mantem a proporcao. Sem ampliar: ela so
    // desliza na horizontal.
    const largura = altura * proporcao;

    // Meio do que o usuario efetivamente enxerga.
    const alvo = desktop
      ? (window.innerWidth * ATE_ONDE_SE_VE) / 2
      : larguraFaixa / 2;

    // Ate onde a imagem PRECISA chegar. No desktop nao e ate o fim da faixa: o
    // trecho depois de ATE_ONDE_SE_VE fica atras do painel de login, entao a
    // imagem pode terminar ali sem que apareca vazio nenhum. E essa folga que
    // deixa deslizar o suficiente sem precisar ampliar a arte.
    const precisaCobrirAte = desktop
      ? window.innerWidth * (ATE_ONDE_SE_VE + 0.02)
      : larguraFaixa;

    const maisAEsquerda = Math.min(0, precisaCobrirAte - largura);
    foto.style.width = `${largura}px`;
    foto.style.left = `${Math.max(maisAEsquerda, Math.min(0, alvo - FOCO * largura))}px`;
    foto.style.top = '0px';
  }

  useLayoutEffect(() => {
    enquadrar();
    window.addEventListener('resize', enquadrar);
    return () => window.removeEventListener('resize', enquadrar);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: TEMA.azulMarinho, fontFamily: FONTE }}
    >
      {/* Base: grafismo sempre presente */}
      <FundoGrafico />

      {/* A arte do torneio, fixa. A mascara em `.faixa-fotos` desfaz a emenda com
          o grafismo, que fica escondida atras do painel. */}
      <div className="faixa-fotos" ref={faixaRef}>
        <img
          ref={fotoRef}
          src={comBase(foto)}
          alt=""
          aria-hidden="true"
          onLoad={enquadrar}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="absolute max-w-none"
        />
      </div>

      {/* Assentam a arte sem apagar a taca - nao ha mais texto sobre a foto */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(9,27,63,.45), rgba(9,27,63,.12) 45%, rgba(9,27,63,0) 72%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(9,27,63,.55), rgba(9,27,63,.10), transparent)' }}
      />

      {/* Painel claro recortado pela elipse... */}
      <div
        className="hidden lg:block absolute inset-y-0 right-0 w-[37%]"
        style={{
          clipPath: 'ellipse(85% 160% at 93% 50%)',
          background: '#FFFFFF',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />
      {/* ...e a LINHA amarela de 10px acompanhando a curva */}
      <svg
        className="hidden lg:block absolute inset-y-0 right-0 w-[37%] h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <ellipse
          cx="93" cy="50" rx="85" ry="160"
          fill="none" stroke={TEMA.amarelo} strokeWidth="10"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Conteudo */}
      <div className="relative z-10 min-h-screen flex flex-col lg:grid lg:grid-cols-[64%_36%]">
        {/* Esquerda: so a arte, e no rodape o nome do torneio sobre a marca da
            FIFA. Nao ha logotipo no alto: a propria arte ja traz a taca e o
            letreiro, e a marca repetida no canto so competia com eles. O titulo do
            SISTEMA tambem nao fica aqui - ele vive no painel branco. */}
        <div className="flex flex-col justify-end px-8 pt-10 pb-12 lg:pl-16 lg:pr-12 lg:pt-12 lg:pb-16 text-white">
          <div className="space-y-3">
            {subheadline && (
              <p
                className="text-[11px] lg:text-xs uppercase tracking-[0.22em] font-semibold"
                style={{ color: TEMA.amarelo }}
              >
                {subheadline}
              </p>
            )}

            {/* O arquivo e monocromatico azul-marinho sobre transparente e sumiria no
                fundo escuro; o filtro passa a marca para branco preservando o alfa.
                Altura nativa e 39px - manter perto disso evita borrar. */}
            <img
              src={comBase("/fifa-logo.webp")}
              alt="FIFA"
              className="h-8 lg:h-9 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Direita: a marca sem letreiro e o bloco de login */}
        <div
          className="relative flex flex-col items-center justify-start px-6 pt-[5vh] lg:pt-[9vh] pb-16 sm:px-10 lg:bg-transparent"
          style={{ background: TEMA.branco }}
        >
          <img
            src={comBase(MARCA)}
            alt="Copa do Mundo Feminina da FIFA 2027"
            className="h-28 lg:h-36 object-contain flex-shrink-0"
          />

          <div className="w-full max-w-sm flex flex-col items-center gap-4 mt-8 lg:mt-[11vh]">
            {children}
          </div>

          <div className="absolute bottom-12 inset-x-0 flex flex-col items-center gap-1.5">
            <img
              src={comBase("/login/logo-apsis-transp.png")}
              alt="APSIS Consultoria"
              className="h-6 object-contain opacity-70"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <p className="text-[10px] text-slate-500">Plataforma de gestão documental</p>
          </div>

          {copyright && (
            <p className="absolute bottom-5 inset-x-0 px-6 text-center text-[11px] text-slate-400">
              {copyright}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
