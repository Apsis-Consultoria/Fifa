import { Goal, SatelliteDish, Store, Sparkles, PlaneTakeoff, Building2 } from 'lucide-react';

/**
 * Icone de cada tipologia de instalacao.
 *
 * Uma familia so, usada no pin do mapa e nas listas, para o mesmo tipo de
 * instalacao ser reconhecido no mesmo desenho em qualquer tela.
 *
 * O estadio nao vem do lucide: a biblioteca nao tem esse desenho, e o generico mais
 * proximo (um campo com bandeira) nao lia como arena. Este aqui e uma arena vista
 * de baixo - arquibancada em elipse, o gramado vazado no meio, a mureta externa e as
 * quatro torres de iluminacao - no espirito da referencia que o Filipe mandou.
 *
 * E preenchido, e nao de traco como os outros icones da familia: no tamanho do pino
 * do mapa (19px) o traco fino sumia. Foi desenhado e conferido nesse tamanho,
 * rasterizando o glifo e olhando o resultado pixel a pixel.
 *
 * Usa `currentColor`: quem define a cor e o container (branco dentro do pino).
 */
function Estadio({ className, ...resto }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...resto}
    >
      {/* arquibancada com o gramado vazado, e a mureta externa embaixo */}
      <path
        fillRule="evenodd"
        d="M12 5.2c-5.2 0-9.4 2.3-9.4 5.1 0 1.7 1.5 3.2 3.8 4.1v2.9c1.5.8 3.4 1.2 5.6 1.2s4.1-.4 5.6-1.2v-2.9c2.3-.9 3.8-2.4 3.8-4.1 0-2.8-4.2-5.1-9.4-5.1Zm0 2.6c2.6 0 4.7 1.1 4.7 2.5s-2.1 2.5-4.7 2.5-4.7-1.1-4.7-2.5 2.1-2.5 4.7-2.5Z"
      />
      {/* torres de iluminacao */}
      <path d="M3.2 3.4h1.1v3.1H3.2zM19.7 3.4h1.1v3.1h-1.1zM8.4 2.2h1.1v2.6H8.4zM14.5 2.2h1.1v2.6h-1.1z" />
    </svg>
  );
}

const ICONES = {
  estadio:            Estadio,
  centro_treinamento: Goal,           // a trave: campo de treino
  ibc:                SatelliteDish,  // centro internacional de transmissao
  comercial_display:  Store,
  queima_fogos:       Sparkles,
  drones:             PlaneTakeoff,   // nao existe icone de drone na versao instalada
};

/** Devolve o componente de icone da tipologia, sem renderizar. */
export function iconeDaTipologia(tipologia) {
  return ICONES[tipologia] || Building2;
}

export default function IconeTipologia({ tipologia, className = 'h-4 w-4', ...resto }) {
  const Icone = iconeDaTipologia(tipologia);
  return <Icone className={className} {...resto} />;
}
