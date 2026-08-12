// Dois arquivos que o GitHub Pages precisa e o Vite nao gera.
//
// Roda junto do `npm run build` de proposito: criados a mao, o proximo build os
// apagaria (a pasta e limpa a cada vez) e o site quebraria em silencio.
//
//   404.html   copia do index. O Pages devolve este arquivo em endereco que ele
//              nao conhece, como /Fifa/instalacoes aberto direto na barra. Sendo a
//              mesma aplicacao, o roteador assume dali e a rota funciona.
//   .nojekyll  desliga o Jekyll, que por padrao ignora arquivos e pastas comecados
//              por ponto ou sublinhado.

import { copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SAIDA = 'docs';

copyFileSync(join(SAIDA, 'index.html'), join(SAIDA, '404.html'));
writeFileSync(join(SAIDA, '.nojekyll'), '');

console.log(`${SAIDA}/404.html e ${SAIDA}/.nojekyll gerados`);
