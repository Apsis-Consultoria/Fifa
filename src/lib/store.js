// Estado da aplicacao.
//
// Prototipo: tudo em localStorage, sem backend. A superficie exposta aqui
// (listar / criar / anexar) e a mesma que um cliente Supabase ofereceria, entao a
// troca por banco real e mecanica.
//
// Modelo, deliberadamente raso e igual ao que foi combinado na reuniao:
//   instalacao  { id, nome, tipologia, cidade, responsavel, criadoEm }
//   documento   { id, instalacaoId, nome, obs, origem, arquivo }
//
// Sem peso por documento: a conclusao e 1 para 1 (anexados / exigidos).

import { useSyncExternalStore } from 'react';
import { catalogoPorTipologia } from './catalogo';
import { guardarArquivo, removerArquivo } from './files';
import { SEDES } from './sedes';

// Versione a chave ao mudar o formato do estado ou o catalogo: navegadores que ja
// tenham a versao antiga em localStorage recebem o seed novo em vez de dados velhos.
const CHAVE = 'fifa27_estado_v6';

// Quantos documentos de cada estadio ja estao entregues no seed. A chave e o id da
// sede em sedes.js - assim o mapa e a lista falam da mesma instalacao.
const ENTREGUES_POR_SEDE = {
  'maracana':          41,
  'neo-quimica-arena': 52,
  'beira-rio':         37,
  'mineirao':          58,
  'mane-garrincha':    44,
  'arena-fonte-nova':  31,
  'arena-pernambuco':  19,
  'castelao':          26,
};

// Instalacoes de demonstracao. Declaradas antes do estado porque `carregar()` roda
// na inicializacao do modulo e chama `seed()`, que depende desta lista.
//
// Os 8 estadios vem de SEDES, para que carreguem lat/lon e imagem e apareçam no
// mapa. As demais instalacoes nao tem coordenada e so aparecem nas listas.
const INSTALACOES_DEMO = [
  ...SEDES.map((s) => ({
    sedeId: s.id,
    nome: s.nome,
    tipologia: 'estadio',
    cidade: s.cidade,
    uf: s.uf,
    lat: s.lat,
    lon: s.lon,
    imagem: s.imagem,
    responsavel: 'Venue Authority',
    entregues: ENTREGUES_POR_SEDE[s.id] ?? 0,
  })),
  { nome: 'IBC - Rio de Janeiro',      tipologia: 'ibc',                cidade: 'Rio de Janeiro', responsavel: 'FIFA27',           entregues: 12 },
  { nome: 'CT da Arbitragem',          tipologia: 'centro_treinamento', cidade: 'Rio de Janeiro', responsavel: 'FIFA27',           entregues: 14 },
  { nome: 'CT Barra da Tijuca',        tipologia: 'centro_treinamento', cidade: 'Rio de Janeiro', responsavel: 'Operador do CT',   entregues: 4  },
  { nome: 'Comercial Display - Praia de Copacabana', tipologia: 'comercial_display', cidade: 'Rio de Janeiro', responsavel: 'Fornecedor de overlay', entregues: 9 },
  { nome: 'Cerimônia de Abertura - Queima de Fogos', tipologia: 'queima_fogos', cidade: 'Rio de Janeiro', responsavel: 'FIFA27',   entregues: 2  },
];

let estado = carregar();
const ouvintes = new Set();

function novoId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

function carregar() {
  try {
    // Descarta estados de versoes anteriores para nao ocupar a cota a toa.
    Object.keys(localStorage)
      .filter((k) => k.startsWith('fifa27_estado_') && k !== CHAVE)
      .forEach((k) => localStorage.removeItem(k));

    const bruto = localStorage.getItem(CHAVE);
    if (bruto) return JSON.parse(bruto);
  } catch {
    // localStorage indisponivel ou conteudo corrompido: cai para o seed
  }
  const inicial = seed();
  persistir(inicial);
  return inicial;
}

function persistir(prox) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(prox));
  } catch {
    // cota estourada: o estado segue valido em memoria durante a sessao
  }
}

function commit(prox) {
  estado = prox;
  persistir(estado);
  ouvintes.forEach((l) => l());
}

// ── Leitura ────────────────────────────────────────────────────────────────

export function useEstado() {
  return useSyncExternalStore(
    (l) => {
      ouvintes.add(l);
      return () => ouvintes.delete(l);
    },
    () => estado,
  );
}

export function getInstalacao(id) {
  return estado.instalacoes.find((i) => i.id === id) || null;
}

export function documentosDe(id) {
  return estado.documentos.filter((d) => d.instalacaoId === id);
}

/** Progresso 1 para 1: quantos dos documentos exigidos ja tem arquivo anexado. */
export function progresso(docs) {
  const total = docs.length;
  const anexados = docs.filter((d) => d.arquivo).length;
  return {
    total,
    anexados,
    pendentes: total - anexados,
    percentual: total === 0 ? 0 : Math.round((anexados / total) * 100),
  };
}

export function progressoDe(instalacaoId) {
  return progresso(documentosDe(instalacaoId));
}

// ── Escrita ────────────────────────────────────────────────────────────────

/**
 * Cria a instalacao e ja instancia os documentos exigidos pela tipologia,
 * a partir do catalogo do Anexo 2. E o passo que substitui a montagem manual
 * da planilha.
 */
export function criarInstalacao({ nome, tipologia, cidade, responsavel }) {
  const instalacao = {
    id: novoId(),
    nome: nome.trim(),
    tipologia,
    cidade: (cidade || '').trim(),
    responsavel: (responsavel || '').trim(),
    criadoEm: new Date().toISOString(),
  };

  const documentos = catalogoPorTipologia(tipologia).map((item) => ({
    id: novoId(),
    instalacaoId: instalacao.id,
    nome: item.nome,
    obs: item.obs || '',
    origem: 'catalogo',
    catalogoId: item.id,
    arquivo: null,
  }));

  commit({
    ...estado,
    instalacoes: [...estado.instalacoes, instalacao],
    documentos: [...estado.documentos, ...documentos],
  });

  return instalacao;
}

export function removerInstalacao(id) {
  const docs = documentosDe(id);
  docs.forEach((d) => d.arquivo?.blobKey && removerArquivo(d.arquivo.blobKey));
  commit({
    ...estado,
    instalacoes: estado.instalacoes.filter((i) => i.id !== id),
    documentos: estado.documentos.filter((d) => d.instalacaoId !== id),
  });
}

/** Documento avulso, fora do catalogo - a "nova solicitacao de documento". */
export function criarDocumento({ instalacaoId, nome, obs }) {
  const doc = {
    id: novoId(),
    instalacaoId,
    nome: nome.trim(),
    obs: (obs || '').trim(),
    origem: 'avulso',
    catalogoId: null,
    arquivo: null,
  };
  commit({ ...estado, documentos: [...estado.documentos, doc] });
  return doc;
}

export function removerDocumento(id) {
  const doc = estado.documentos.find((d) => d.id === id);
  if (doc?.arquivo?.blobKey) removerArquivo(doc.arquivo.blobKey);
  commit({ ...estado, documentos: estado.documentos.filter((d) => d.id !== id) });
}

/** Anexa o arquivo ao documento. Os bytes vao para o IndexedDB; aqui fica so o registro. */
export async function anexar(documentoId, file) {
  const blobKey = novoId();
  await guardarArquivo(blobKey, file);

  const arquivo = {
    nome: file.name,
    tamanho: file.size,
    tipo: file.type,
    enviadoEm: new Date().toISOString(),
    blobKey,
  };

  commit({
    ...estado,
    documentos: estado.documentos.map((d) =>
      d.id === documentoId ? { ...d, arquivo } : d,
    ),
  });
}

export function desanexar(documentoId) {
  const doc = estado.documentos.find((d) => d.id === documentoId);
  if (doc?.arquivo?.blobKey) removerArquivo(doc.arquivo.blobKey);
  commit({
    ...estado,
    documentos: estado.documentos.map((d) =>
      d.id === documentoId ? { ...d, arquivo: null } : d,
    ),
  });
}

export function reiniciarDemo() {
  const inicial = seed();
  commit(inicial);
}

// ── Seed de demonstracao ───────────────────────────────────────────────────
//
// Parte da documentacao ja entregue (ver INSTALACOES_DEMO, no topo) para que a
// visao gerencial nasca com numeros. Os itens marcados como entregues apontam
// para um arquivo de demonstracao, sem bytes no IndexedDB - o app avisa ao tentar
// baixar.

/**
 * Data de entrega de um documento do seed, espalhada pelos ultimos 5 meses.
 *
 * Sem isto todos os anexos da demonstracao nasciam com o mesmo instante e o
 * indicador de ritmo de entrega ficava sem sentido. A conta e deterministica
 * (deriva do id do documento) e o expoente concentra mais entregas nas semanas
 * recentes, como acontece quando um projeto engrena.
 */
function dataDeEntrega(semente) {
  const t = ((semente * 3607) % 1000) / 1000;
  const dias = Math.round(150 * Math.pow(t, 1.7));
  return new Date(Date.now() - dias * 86_400_000).toISOString();
}

function seed() {
  const instalacoes = [];
  const documentos = [];

  INSTALACOES_DEMO.forEach((base, ordem) => {
    const instalacao = {
      id: base.sedeId ? `sede-${base.sedeId}` : `demo-${ordem}`,
      nome: base.nome,
      tipologia: base.tipologia,
      cidade: base.cidade,
      responsavel: base.responsavel,
      criadoEm: new Date().toISOString(),
      // Presentes so nos estadios: alimentam o mapa da tela inicial.
      ...(base.lat != null && { uf: base.uf, lat: base.lat, lon: base.lon, imagem: base.imagem }),
    };
    instalacoes.push(instalacao);

    catalogoPorTipologia(base.tipologia).forEach((item, i) => {
      documentos.push({
        id: `${base.sedeId ? `sede-${base.sedeId}` : `demo-${ordem}`}-${item.id}`,
        instalacaoId: instalacao.id,
        nome: item.nome,
        obs: item.obs || '',
        origem: 'catalogo',
        catalogoId: item.id,
        arquivo:
          i < base.entregues
            ? {
                nome: `${item.nome.slice(0, 48)}.pdf`,
                tamanho: 180_000 + ((item.id * 7919) % 2_400_000),
                tipo: 'application/pdf',
                enviadoEm: dataDeEntrega(item.id + ordem * 31),
                blobKey: null, // demonstracao: sem bytes
                demo: true,
              }
            : null,
      });
    });
  });

  return { instalacoes, documentos };
}
