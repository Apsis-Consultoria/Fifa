# Gestão Regulatória e Licenciamento - FWWC 2027

Protótipo do portal de gestão documental da APSIS para a RFI 39 da FIFA
(Copa do Mundo Feminina Brasil 2027). As pessoas anexam os documentos exigidos por
instalação, e a visão gerencial se monta sozinha em cima dessas entregas.

## Como rodar

```bash
npm install
```

```bash
npm run dev
```

Abre em `http://localhost:5173`. O login aceita qualquer credencial - não há
autenticação no protótipo.

## O que o protótipo faz

**Mapa das cidades-sede.** Fecha a visão gerencial: os 8 estádios de competição
posicionados sobre o mapa do Brasil pelas coordenadas reais, cada um com a arte da
sede. A conformidade aparece na cor do estado pintado, não em marcas sobre o desenho.
Clicar em um estádio abre a documentação dele; a lista ao lado nomeia todas as
instalações, da menor para a maior conformidade. A aproximação é pelos botões + e -.

Rio, São Paulo e Belo Horizonte ficam a poucos graus um do outro, e no Nordeste
Fortaleza, Recife e Salvador se enfileiram na costa: as artes colidiriam. Um passo
de desamontoamento ([`src/lib/declutter.js`](src/lib/declutter.js)) afasta os
marcadores até pararem de se sobrepor. O dado geográfico continua correto; só o
desenho se desloca.

**Cadastro de instalação com documentos automáticos.** Ao criar uma instalação e
escolher a tipologia, o sistema já instancia todos os documentos exigidos por aquela
tipologia. Um estádio nasce com 67 documentos, um centro de treinamento com 17.
É o passo que substitui a montagem manual da planilha.

**Anexo por arrastar.** Cada linha do checklist aceita um arquivo arrastado por cima,
ou o botão "Anexar". O documento passa a contar como entregue e os percentuais se
recalculam na hora.

**Solicitação avulsa.** Para exigências fora do catálogo padrão, o botão "Nova
solicitação" cria um documento com nome e descrição livres.

**Visão gerencial.** Seis indicadores no topo, conformidade por cidade, por tipologia
e por responsável, as exigências que mais se repetem em aberto (o mesmo documento
pendente em várias instalações, que rende ação conjunta) e o ritmo de entrega por
quinzena.

A conclusão é 1 para 1 - documentos anexados sobre documentos exigidos, sem peso por
documento.

## O catálogo de documentos

`src/lib/catalogo.js` traz os **152 documentos** do Anexo 2 da RFI 39 (aba "Rate
Card"), organizados nas 6 tipologias da FIFA:

| Tipologia | Documentos |
|---|---|
| Estádio | 67 |
| IBC | 35 |
| Comercial Display | 21 |
| Centro de Treinamento | 17 |
| Queima de Fogos | 6 |
| Drones | 6 |

O arquivo é gerado a partir da planilha original, então dá para regerar quando a FIFA
publicar uma versão nova. As ressalvas da própria planilha (por exemplo "Específico
RJ", "Quando aplicável") viram etiquetas na interface.

## Identidade visual

O tema reproduz a identidade oficial do torneio. As cores foram lidas diretamente do
site da FIFA (`fifa.com/pt/tournaments/womens/womensworldcup/brazil-2027`), a partir
do que está de fato renderizado na página - não são aproximações:

| Cor | Uso no site oficial | Uso aqui |
|---|---|---|
| `#1807E5` | barra de navegação, hero, links | barra lateral, filtros ativos, destaques |
| `#FFFBEB` | fundo da página (`ff-bg-primary`) | fundo da aplicação |
| `#FFD033` | botões de ação, com texto azul | botões primários, item de menu ativo |
| `#067517` | faixa do contador regressivo | status de conformidade alta |
| `#091B3F` | azul-marinho | títulos |

A tipografia do site é a **FIFASans**, proprietária da FIFA e não distribuída. O
próprio site declara **Poppins** como primeiro fallback, então é ela que o protótipo
usa. Os botões seguem o `border-radius: 100px` do site, em pílula.

Tudo isso vive em [`src/lib/tema.js`](src/lib/tema.js) - nenhum componente tem cor
escrita direto, então trocar a paleta é mexer em um arquivo só.

O emblema oficial vem em duas versões, ambas com o letreiro nativo
"FIFA WOMEN'S WORLD CUP BRASIL 2027" - por isso nenhuma tela escreve o nome do
torneio ao lado da marca:

| Arquivo | Letreiro | Onde |
|---|---|---|
| `public/fwwc2027-emblema.svg` | branco | fundo escuro (barra lateral) |
| `public/fwwc2027-logo.png` | preto, sobre o painel branco oficial | fundo claro (painel do login) |

É marca registrada: o uso na proposta final depende de liberação da FIFA.

### Tela de login

Mesma estrutura do portal APSIS, com a paleta da Copa: split 64%/36%, painel direito
recortado por elipse (`ellipse(85% 160% at 93% 50%)`), emblema de 235px a 9vh do topo
e bloco de login com gap de 11vh. O que mudou em relação ao portal foi só a cor - o
verde virou o azul do torneio e a linha da curva, de laranja, virou amarela.

**Imagens de fundo.** Ficam em `public/login-copa/` e são listadas na constante
`BACKGROUNDS`, no topo de
[`src/components/CopaLoginLayout.jsx`](src/components/CopaLoginLayout.jsx). Com duas
ou mais, entra um slideshow com crossfade a cada 6,5s. Com a lista vazia, o fundo cai
no grafismo em SVG (geometria de campo e losango da bandeira), então a tela funciona
mesmo sem foto nenhuma. Imagem que falhar ao carregar simplesmente some, sem quebrar
o layout.

## Arquitetura

Stack idêntica à do Secure Share: React 18 + Vite + Tailwind + shadcn/ui.

```
src/
  lib/catalogo.js     152 documentos por tipologia (gerado do Anexo 2)
  lib/store.js        Estado da aplicação (localStorage)
  lib/files.js        Bytes dos anexos (IndexedDB)
  lib/tema.js         Paleta e tipografia do torneio
  lib/sedes.js        As 8 cidades-sede: estádio, cidade, lat/lon, arte
  lib/mapaBrasil.js   Contorno dos 27 estados + projeção lat/lon
  lib/declutter.js    Afasta marcadores sobrepostos no mapa
  pages/              Login, Dashboard, Instalacoes, InstalacaoDetalhe
  components/         AppLayout, CopaLayout, CopaLoginLayout, MapaSedes, Donut, ui/
```

**Não há backend.** O estado fica em `localStorage` e os arquivos em `IndexedDB`, no
próprio navegador: a demo roda sem infraestrutura nenhuma e sem risco de dados
sensíveis saírem da máquina. As duas fronteiras são estreitas de propósito:

- `lib/store.js` expõe listar/criar/anexar, a mesma superfície que um cliente
  Supabase ofereceria
- `lib/files.js` conhece só a `blobKey`, então trocar por SharePoint (Microsoft
  Graph) ou por um bucket do Supabase não toca em nenhuma tela

O Secure Share já tem a integração com o Graph pronta e testada em produção
(`supabase/functions/_shared/graph.ts` e as funções de upload e download), incluindo
upload resumável até 10 GB e marca d'água em PDF.

## Dados de demonstração

O app abre com 13 instalações (os 8 estádios de competição, o IBC, dois centros de
treinamento, um comercial display e a queima de fogos da abertura) e 632 documentos,
349 deles já entregues, para que a visão gerencial nasça com números. Os documentos marcados como entregues no seed são
registros sem conteúdo real - o app avisa ao tentar baixar. Arquivos anexados de
verdade durante a demo baixam normalmente.

## O que falta para virar sistema

Este protótipo cobre anexar documentos e ver a análise gerencial. Para produção, a
RFI pede coisas que ainda não estão aqui: status intermediários (protocolado,
exigência, vencido), prazos e vencimentos, responsável legal separado de quem cobra,
trilha de cobrança e portal para terceiros.
