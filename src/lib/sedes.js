// As 8 cidades-sede da FWWC 2027 e seus estadios.
//
// `arte` descreve o desenho do estadio para o mapa:
//   proporcao  largura / altura do arquivo, ja recortado no conteudo. Fica aqui
//              para o marcador nascer com o tamanho certo, sem esperar a imagem
//              carregar. Ao trocar uma arte, remedir.
//   escala     ajuste fino. As artes vem da FIFA em escalas internas diferentes:
//              no desenho de Salvador o estadio ocupa menos da metade da largura,
//              cercado de cenario, enquanto no de Porto Alegre ele toma quase tudo.
//              Igualar so a area do arquivo deixava Salvador visivelmente menor que
//              os outros. O fator compensa isso - foi ajustado no olho, comparando
//              os estadios lado a lado no tamanho em que aparecem no mapa.
//
// Cidades confirmadas no Q&A da RFI 39: Rio de Janeiro, Sao Paulo, Porto Alegre,
// Belo Horizonte, Brasilia, Salvador, Recife e Fortaleza.
//
// lat/lon sao as coordenadas do estadio, usadas para posicionar o marcador no mapa
// pela funcao `projetar` de mapaBrasil.js.

export const SEDES = [
  {
    id: 'maracana',
    nome: 'Estádio do Maracanã',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    lat: -22.9121,
    lon: -43.2302,
    imagem: '/estadios/maracana.png',
    arte: { proporcao: 1.142, escala: 1.00 },
  },
  {
    id: 'neo-quimica-arena',
    nome: 'Neo Química Arena',
    cidade: 'São Paulo',
    uf: 'SP',
    lat: -23.5453,
    lon: -46.4742,
    imagem: '/estadios/neo-quimica-arena.png',
    arte: { proporcao: 1.596, escala: 1.30 },
  },
  {
    id: 'beira-rio',
    nome: 'Estádio Beira-Rio',
    cidade: 'Porto Alegre',
    uf: 'RS',
    lat: -30.0653,
    lon: -51.2359,
    imagem: '/estadios/beira-rio.png',
    arte: { proporcao: 1.289, escala: 0.95 },
  },
  {
    id: 'mineirao',
    nome: 'Mineirão',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    lat: -19.8659,
    lon: -43.9707,
    imagem: '/estadios/mineirao.png',
    arte: { proporcao: 1.259, escala: 1.00 },
  },
  {
    id: 'mane-garrincha',
    nome: 'Estádio Mané Garrincha',
    cidade: 'Brasília',
    uf: 'DF',
    lat: -15.7835,
    lon: -47.8992,
    imagem: '/estadios/mane-garrincha.png',
    arte: { proporcao: 1.150, escala: 1.05 },
  },
  {
    id: 'arena-fonte-nova',
    nome: 'Arena Fonte Nova',
    cidade: 'Salvador',
    uf: 'BA',
    lat: -12.9786,
    lon: -38.5045,
    imagem: '/estadios/arena-fonte-nova.png',
    arte: { proporcao: 1.282, escala: 1.15 },
  },
  {
    id: 'arena-pernambuco',
    nome: 'Arena Pernambuco',
    cidade: 'Recife',
    uf: 'PE',
    lat: -8.0389,
    lon: -35.0086,
    imagem: '/estadios/arena-pernambuco.png',
    arte: { proporcao: 1.227, escala: 1.05 },
  },
  {
    id: 'castelao',
    nome: 'Arena Castelão',
    cidade: 'Fortaleza',
    uf: 'CE',
    lat: -3.8073,
    lon: -38.5223,
    imagem: '/estadios/castelao.png',
    arte: { proporcao: 1.301, escala: 0.95 },
  },
];

/** UFs que sediam jogos - usadas para destacar os estados no mapa. */
export const UFS_SEDE = SEDES.map((s) => s.uf);
