// Paleta e tipografia da Copa do Mundo Feminina da FIFA 2027.
//
// Os valores foram extraidos do site oficial do torneio
// (fifa.com/pt/tournaments/womens/womensworldcup/brazil-2027), lendo as cores
// efetivamente renderizadas na pagina - nao sao aproximacoes.
//
//   #1807E5  barra de navegacao, fundo do hero e cor dos links
//   #FFFBEB  fundo da pagina inteira (classe ff-bg-primary)
//   #FFD033  preenchimento dos botoes de acao, com texto em azul
//   #FFDC4E  amarelo claro (skip link)
//   #067517  faixa do contador regressivo
//   #091B3F  azul-marinho profundo
//
// Tipografia do site: "FIFASans" (proprietaria da FIFA, nao distribuida), com
// Poppins declarada como primeiro fallback. Usamos Poppins, que e a fonte publica
// mais proxima do que a FIFA especifica.
//
// Botoes no site tem border-radius: 100px - pilula completa.

export const TEMA = {
  // Primaria
  azul:        '#1807E5',
  azulEscuro:  '#1205B4',
  azulMarinho: '#091B3F',

  // Fundo
  creme:       '#FFFBEB',
  cremeEscuro: '#F5EFD9',

  // Acao
  amarelo:      '#FFD033',
  amareloClaro: '#FFDC4E',

  // Secundaria
  verde:       '#067517',

  branco:      '#FFFFFF',

  // Semanticas de status
  critico:     '#E21C4C',
  atencao:     '#FFD033',
  bom:         '#067517',
};

/** Raio de pilula usado nos botoes do site oficial. */
export const RAIO_PILULA = '100px';

/** Cor do indicador de conformidade conforme a faixa de conclusao. */
export function corDoProgresso(pct) {
  if (pct >= 80) return TEMA.verde;
  if (pct >= 50) return TEMA.amarelo;
  return TEMA.critico;
}

// Poppins e o primeiro fallback declarado pela propria FIFA para a FIFASans.
export const FONTE = "'Poppins', 'Helvetica Neue', Arial, sans-serif";

/** Botao de acao primario: amarelo com texto azul, em pilula. Igual ao do site. */
export const BOTAO_PRIMARIO = {
  background: TEMA.amarelo,
  color: TEMA.azul,
  borderRadius: RAIO_PILULA,
};

/** Botao sobre fundo azul: branco com texto azul. */
export const BOTAO_CLARO = {
  background: TEMA.branco,
  color: TEMA.azul,
  borderRadius: RAIO_PILULA,
};

// Emblema oficial do torneio, em duas versoes. Ambas ja trazem o letreiro nativo
// "FIFA WOMEN'S WORLD CUP BRASIL 2027", entao nenhuma tela escreve o nome ao lado.
// Marca registrada: o uso final na proposta depende de liberacao da FIFA.

/** Versao do digitalhub da FIFA: letreiro em branco. Para FUNDO ESCURO (barra lateral). */
export const EMBLEMA_CLARO = '/fwwc2027-emblema.svg';

/** Lockup sobre o painel branco oficial. Para FUNDO CLARO (painel do login). */
export const EMBLEMA_PAINEL = '/fwwc2027-logo.png';
