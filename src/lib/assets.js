// Caminho de um arquivo de `public/`, resolvido contra a base da aplicacao.
//
// No `npm run dev` a base e `/`; publicado no GitHub Pages, o endereco tem o nome
// do repositorio no meio (`/Fifa/`) e um `/estadios/maracana.png` cru cairia fora
// do site. O Vite reescreve sozinho o que passa por `import`, mas nao string solta
// dentro do codigo - que e o caso das artes das sedes e das fotos do login.
//
// Os caminhos ficam CRUS nos dados (sedes.js, tema.js, e o estado gravado em
// localStorage) e so ganham a base na hora de desenhar. Se a base entrasse no dado,
// um estado gravado rodando local deixaria de casar com o publicado - foi assim que
// os marcadores do mapa ja sairam todos do mesmo tamanho uma vez.

export function comBase(caminho) {
  if (!caminho) return caminho;
  return `${import.meta.env.BASE_URL}${String(caminho).replace(/^\//, '')}`;
}
