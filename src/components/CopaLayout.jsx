import { EMBLEMA_CLARO } from '@/lib/tema';

/**
 * Marca do torneio para a barra lateral.
 *
 * Usa a versao de fundo escuro do emblema, que ja traz o letreiro nativo
 * ("FIFA WOMEN'S WORLD CUP BRASIL 2027") em branco - por isso nenhum texto e
 * acrescentado ao lado. A largura precisa ser generosa: o letreiro fica no terco
 * de baixo da marca e some se ela encolher demais.
 */
export function MarcaTorneio({ largura = 148, className = '' }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={EMBLEMA_CLARO}
        alt="Copa do Mundo Feminina da FIFA Brasil 2027"
        style={{ width: largura }}
        className="h-auto object-contain"
      />
    </div>
  );
}
