import { LOGOTIPO } from '@/lib/tema';
import { comBase } from '@/lib/assets';

/**
 * Marca do torneio para o menu lateral.
 *
 * Usa o logotipo de letreiro PRETO, porque o menu passou a ser branco. Ele ja traz
 * o nome do torneio no proprio desenho ("FIFA WOMEN'S WORLD CUP BRASIL 2027"), por
 * isso nenhuma tela escreve o nome ao lado. A largura precisa ser generosa: o
 * letreiro fica no terco de baixo da marca e some se ela encolher demais.
 */
export function MarcaTorneio({ largura = 132, className = '' }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src={comBase(LOGOTIPO)}
        alt="Copa do Mundo Feminina da FIFA Brasil 2027"
        style={{ width: largura }}
        className="h-auto object-contain"
      />
    </div>
  );
}
