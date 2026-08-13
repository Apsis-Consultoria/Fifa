// Paleta e tipografia da Copa do Mundo Feminina da FIFA 2027.
//
// As cores do torneio foram extraidas do site oficial
// (fifa.com/pt/tournaments/womens/womensworldcup/brazil-2027), lendo as cores
// efetivamente renderizadas na pagina - nao sao aproximacoes.
//
//   #1807E5  barra de navegacao, fundo do hero e cor dos links
//   #FFFBEB  fundo da pagina inteira (classe ff-bg-primary)
//   #FFD033  preenchimento dos botoes de acao, com texto em azul
//   #067517  faixa do contador regressivo
//   #091B3F  azul-marinho profundo
//
// ── ONDE CADA COISA VALE ─────────────────────────────────────────────────────
//
// LOGIN: veste a identidade do torneio - foto, azul-marinho, a linha amarela
// acompanhando a curva do painel.
//
// DENTRO DO SISTEMA: fundo branco, caixas delimitadas por borda cinza e sombra,
// e o azul do torneio como unica cor de acao (icones, botoes, item ativo do menu).
// O amarelo NAO aparece mais como cor de botao aqui dentro; ele sobrou so como
// faixa de status (50% a 79% de conformidade). A troca foi pedida pelo Filipe:
// creme com botao amarelo lia como pagina de campanha, nao como sistema de
// trabalho. Quem separa uma caixa da outra agora e a borda cinza com sombra.
//
// Tipografia do site: "FIFASans" (proprietaria da FIFA, nao distribuida), com
// Poppins declarada como primeiro fallback. Usamos Poppins, que e a fonte publica
// mais proxima do que a FIFA especifica.

export const TEMA = {
  // Primaria - a unica cor de acao dentro do sistema
  azul:        '#1807E5',
  azulEscuro:  '#1205B4',
  azulMarinho: '#091B3F',

  // Superficies do sistema
  branco:      '#FFFFFF',
  borda:       '#E2E8F0',   // divisoria das caixas
  bordaForte:  '#CBD5E1',   // a mesma divisoria em foco/hover
  linha:       '#F1F5F9',   // separador interno, mais leve que a borda

  // Texto
  texto:       '#0F172A',
  textoSuave:  '#64748B',
  textoFraco:  '#94A3B8',

  // Identidade do torneio - login e detalhes de marca
  creme:       '#FFFBEB',
  amarelo:     '#FFD033',
  amareloClaro:'#FFDC4E',

  // Semanticas de status
  verde:       '#067517',
  critico:     '#E21C4C',
  atencao:     '#FFD033',
  bom:         '#067517',
};

/** Fundo do realce ao passar o mouse: o azul do torneio bem diluido. */
export const REALCE = 'rgba(24,7,229,0.06)';

/** Fundo de apoio para pilulas e icones em destaque. */
export const REALCE_FORTE = 'rgba(24,7,229,0.10)';

/** Raio de pilula usado nos botoes do site oficial. */
export const RAIO_PILULA = '100px';

/** Raio das caixas do sistema. */
export const RAIO_CAIXA = 12;

/**
 * Caixa padrao do sistema: branca sobre fundo branco, separada por borda cinza e
 * sombra. E o que substitui o antigo cartao creme com borda bege.
 */
export const CLASSE_CARTAO =
  'bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]';

/** A mesma caixa, quando e clicavel. */
export const CLASSE_CARTAO_CLICAVEL =
  `${CLASSE_CARTAO} transition-all hover:border-[#1807E5]/40 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] cursor-pointer`;

/** Cor do indicador de conformidade conforme a faixa de conclusao. */
export function corDoProgresso(pct) {
  if (pct >= 80) return TEMA.verde;
  if (pct >= 50) return TEMA.amarelo;
  return TEMA.critico;
}

// Poppins e o primeiro fallback declarado pela propria FIFA para a FIFASans.
export const FONTE = "'Poppins', 'Helvetica Neue', Arial, sans-serif";

/**
 * A `sans-serif` generica do CSS, para o titulo do login.
 *
 * E literalmente o que o Filipe pediu: sans-serif bold. Primeiro tentei uma pilha
 * de fontes de sistema (ui-sans-serif, system-ui, Segoe UI) e nao era isso - o
 * navegador caia na fonte da interface do Windows. Deixando a familia generica,
 * quem escolhe e o proprio navegador: Arial no Windows, Helvetica no Mac.
 *
 * A Poppins da marca continua valendo no resto da tela; ela tem desenho geometrico
 * e arredondado, boa para o torneio e pesada demais para um titulo de sistema.
 */
export const FONTE_TITULO = 'sans-serif';

/** Botao de acao primario do sistema: azul solido com texto branco. */
export const BOTAO_PRIMARIO = {
  background: TEMA.azul,
  color: TEMA.branco,
  borderRadius: RAIO_PILULA,
};

/** Botao secundario: branco com contorno e texto azuis. */
export const BOTAO_SECUNDARIO = {
  background: TEMA.branco,
  color: TEMA.azul,
  border: `1px solid ${TEMA.azul}`,
  borderRadius: RAIO_PILULA,
};

// ── Marca do torneio ────────────────────────────────────────────────────────
// Marca registrada: o uso final na proposta depende de liberacao da FIFA.
//
// Tres recortes do MESMO logotipo oficial, para nao misturar versoes:

/** Logotipo completo, letreiro preto. Para fundo claro (menu lateral). */
export const LOGOTIPO = '/fwwc2027-logotipo.png';

/** O mesmo logotipo com o letreiro em branco. Para fundo escuro (foto do login). */
export const LOGOTIPO_BRANCO = '/fwwc2027-logotipo-branco.png';

/** So a marca (o "W" com a taca), sem o letreiro. Para o painel do login. */
export const MARCA = '/fwwc2027-marca.png';
