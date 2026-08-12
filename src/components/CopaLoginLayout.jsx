import { useState, useEffect } from 'react';
import { TEMA, FONTE, EMBLEMA_PAINEL } from '@/lib/tema';
import { comBase } from '@/lib/assets';

/**
 * Layout de login no padrao do portal APSIS, na identidade da Copa.
 *
 * Esquerda: fundo corporativo (slideshow com crossfade) + overlays + headline.
 * Direita: painel claro com borda esquerda curva (clip-path), emblema do torneio e
 *   a area de login (children). No mobile, empilha.
 *
 * Proporcoes IDENTICAS as do portal-apsis: grid 64%/36%, painel w-[37%] com
 * ellipse(85% 160% at 93% 50%), logo 235px a 9vh do topo e bloco de login com gap
 * de 11vh. O que muda em relacao ao portal e so a paleta: o verde da APSIS vira o
 * azul do torneio e a linha laranja vira o amarelo.
 *
 * A logica de autenticacao NAO vive aqui - os forms entram como children.
 *
 * ── IMAGENS DE FUNDO ──────────────────────────────────────────────────────────
 * Coloque os arquivos em `public/login-copa/` e liste-os em BACKGROUNDS abaixo.
 * Com a lista vazia, o fundo cai no grafismo em SVG (geometria de campo + losango
 * da bandeira) - nada quebra e a tela segue apresentavel.
 *
 * As fotos NAO ocupam a largura inteira: param em LARGURA_FOTO (76%), pouco depois
 * de onde o painel de login comeca a cobrir a tela (a elipse chega a 66%). Esse
 * detalhe e o que faz o enquadramento funcionar - com a foto esticada de ponta a
 * ponta, o recorte do `object-fit: cover` sobra quase nada na horizontal e o
 * `object-position` deixa de ter efeito. Numa caixa mais estreita sobra recorte de
 * verdade, e ai da para escolher QUAL parte da foto aparece.
 *
 * `posicao` e esse object-position horizontal: 0% mostra a borda esquerda da foto,
 * 100% a direita. Como o painel cobre o lado direito da tela, as fotos com o motivo
 * mais a direita (a jogadora de vermelho em 57% da largura, o trofeu em 53%) pedem
 * valores MENORES, que puxam o recorte para o inicio da foto e trazem o motivo para
 * o meio da area visivel. Os valores abaixo foram medidos foto a foto.
 */

// A largura da faixa (76%) e a mascara da emenda estao em `.faixa-fotos`,
// no index.css, porque so valem no desktop - no mobile a foto ocupa tudo.

export const BACKGROUNDS = [
  { src: '/login-copa/FPLS_WWC_MOMENTS_HP_Slider_WebApp_BG_01.avif', posicao: '54%' },
  { src: '/login-copa/Germany-v-Colombia-Group-H-FIFA-Women-s-World-Cup-Australia-New-Zealand-2023.avif', posicao: '0%' },
  { src: '/login-copa/26HHAK.avif', posicao: '20%' },
  { src: '/login-copa/107821572.avif', posicao: '0%' },
  { src: '/login-copa/74th-FIFA-Congress-FIFA-Council-Meeting.avif', posicao: '40%' },
];

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
  backgrounds = BACKGROUNDS,
  headline = 'Gestão Regulatória e Licenciamento de Instalações',
  subheadline = 'Copa do Mundo Feminina da FIFA Brasil 2027',
  copyright = '© 2026 APSIS Consultoria. Todos os direitos reservados.',
}) {
  const imgs = backgrounds && backgrounds.length ? backgrounds : [];
  const [idx, setIdx] = useState(0);

  // Slideshow com crossfade - so ativa com 2+ imagens
  useEffect(() => {
    if (imgs.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % imgs.length), 6500);
    return () => clearInterval(t);
  }, [imgs.length]);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: TEMA.azulMarinho, fontFamily: FONTE }}
    >
      {/* Base: grafismo sempre presente */}
      <FundoGrafico />

      {/* Fotos: camadas empilhadas com crossfade por opacidade.
          A caixa para antes da borda direita (ver LARGURA_FOTO) e a mascara desfaz
          a emenda com o grafismo, que fica atras do painel de login. */}
      <div className="faixa-fotos">
        {imgs.map((foto, i) => (
          <img
            key={foto.src}
            src={comBase(foto.src)}
            alt=""
            aria-hidden="true"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            style={{ objectPosition: `${foto.posicao || '50%'} center` }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
              i === idx ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Overlays p/ legibilidade do texto a esquerda - nao encostam no painel */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(9,27,63,.93), rgba(9,27,63,.58) 45%, rgba(9,27,63,0) 72%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(9,27,63,.86), rgba(9,27,63,.25), transparent)' }}
      />

      {/* Painel claro recortado pela elipse... */}
      <div
        className="hidden lg:block absolute inset-y-0 right-0 w-[37%]"
        style={{
          clipPath: 'ellipse(85% 160% at 93% 50%)',
          background: 'rgba(255,251,235,0.94)',
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
        {/* Esquerda: texto e, travado no rodape, a marca da FIFA */}
        <div className="flex flex-col justify-end gap-7 px-8 pt-16 pb-12 lg:pl-16 lg:pr-12 lg:pb-16 text-white">
          <div className="max-w-2xl space-y-4">
            {subheadline && (
              <p
                className="text-[11px] lg:text-xs uppercase tracking-[0.22em] font-semibold"
                style={{ color: TEMA.amarelo }}
              >
                {subheadline}
              </p>
            )}
            {headline && (
              <h1 className="text-2xl lg:text-4xl font-bold leading-[1.15]">{headline}</h1>
            )}
          </div>

          {/* O arquivo e monocromatico azul-marinho sobre transparente e sumiria no
              fundo escuro; o filtro passa a marca para branco preservando o alfa.
              Altura nativa e 39px - manter perto disso evita borrar. */}
          <img
            src={comBase("/fifa-logo.webp")}
            alt="FIFA"
            className="h-8 lg:h-9 w-auto object-contain self-start"
            style={{ filter: 'brightness(0) invert(1)' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Direita: emblema 235px a 9vh do topo + bloco de login com gap 11vh */}
        <div
          className="relative flex flex-col items-center justify-start px-6 pt-[5vh] lg:pt-[9vh] pb-16 sm:px-10 lg:bg-transparent"
          style={{ background: TEMA.creme }}
        >
          <img
            src={comBase(EMBLEMA_PAINEL)}
            alt="Copa do Mundo Feminina da FIFA 2027"
            className="h-44 lg:h-[235px] object-contain flex-shrink-0"
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
