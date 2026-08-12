// Armazenamento dos arquivos anexados.
//
// No prototipo os bytes ficam em IndexedDB, no proprio navegador: nao ha backend
// e a demo roda sem nenhuma infraestrutura. O restante do app so conhece a
// "blobKey", entao trocar esta camada por SharePoint (Microsoft Graph) ou por um
// bucket do Supabase nao toca em nenhuma tela - e a mesma fronteira que o Secure
// Share usa hoje para falar com o Graph.

const DB_NAME = 'fifa27-gestao-regulatoria';
const STORE = 'arquivos';

function abrir() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function transacao(modo, fn) {
  return abrir().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, modo);
        const req = fn(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function guardarArquivo(chave, blob) {
  return transacao('readwrite', (store) => store.put(blob, chave));
}

export function lerArquivo(chave) {
  return transacao('readonly', (store) => store.get(chave));
}

export function removerArquivo(chave) {
  return transacao('readwrite', (store) => store.delete(chave));
}

/** Dispara o download do arquivo anexado. Retorna false se os bytes nao existirem. */
export async function baixarArquivo(arquivo) {
  if (!arquivo?.blobKey) return false;
  const blob = await lerArquivo(arquivo.blobKey);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = arquivo.nome || 'documento';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}

export function formatarTamanho(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
