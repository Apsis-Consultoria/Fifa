// Afasta marcadores que se sobrepoem no mapa.
//
// Rio, Sao Paulo e Belo Horizonte ficam a poucos graus um do outro, e no Nordeste
// Fortaleza, Recife e Salvador se enfileiram na costa: com o cartao do estadio
// ancorado no ponto exato, eles colidem. Aqui os cartoes sao empurrados ate parar
// de se sobrepor, e a tela desenha uma linha-guia ligando cada cartao ao ponto
// real da cidade - o dado geografico continua correto, so o rotulo se desloca.
//
// Determinístico: mesma entrada, mesma saida. Sem aleatoriedade.

/**
 * @param {Array<{id: string, x: number, y: number}>} pontos posicoes exatas, em % (0-100)
 * @param {{largura: number, altura: number, folga?: number, iteracoes?: number}} opcoes
 *        largura/altura do cartao, tambem em % do lado do mapa
 * @returns {Array<{id, x, y, cx, cy}>} x/y = ponto exato; cx/cy = centro do cartao
 */
export function desamontoar(pontos, { largura, altura, folga = 1, iteracoes = 220 }) {
  const minX = largura + folga;
  const minY = altura + folga;

  // Comeca com o cartao logo acima do ponto, como um pin.
  const cartoes = pontos.map((p) => ({ ...p, cx: p.x, cy: p.y - altura / 2 }));

  for (let passo = 0; passo < iteracoes; passo++) {
    let colidiu = false;

    for (let i = 0; i < cartoes.length; i++) {
      for (let j = i + 1; j < cartoes.length; j++) {
        const a = cartoes[i];
        const b = cartoes[j];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const sobrX = minX - Math.abs(dx);
        const sobrY = minY - Math.abs(dy);

        if (sobrX <= 0 || sobrY <= 0) continue;
        colidiu = true;

        // Separa pelo eixo de menor penetracao - o empurrao mais curto.
        if (sobrX < sobrY) {
          const s = (dx === 0 ? 1 : Math.sign(dx)) * (sobrX / 2 + 0.01);
          a.cx -= s;
          b.cx += s;
        } else {
          const s = (dy === 0 ? 1 : Math.sign(dy)) * (sobrY / 2 + 0.01);
          a.cy -= s;
          b.cy += s;
        }
      }
    }

    // Mola fraca de volta ao ponto: evita que o cartao vagueie longe da cidade.
    for (const c of cartoes) {
      c.cx += (c.x - c.cx) * 0.02;
      c.cy += (c.y - altura / 2 - c.cy) * 0.02;
    }

    if (!colidiu) break;
  }

  return cartoes;
}
