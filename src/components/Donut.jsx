// Grafico de rosca em SVG puro - sem dependencia de biblioteca de chart.

export default function Donut({ fatias, tamanho = 190, espessura = 26, centro }) {
  const total = fatias.reduce((s, f) => s + f.valor, 0);
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;

  let acumulado = 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`}>
        <g transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}>
          <circle
            cx={tamanho / 2}
            cy={tamanho / 2}
            r={raio}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={espessura}
          />
          {total > 0 &&
            fatias.map((fatia) => {
              const proporcao = fatia.valor / total;
              const traco = proporcao * circunferencia;
              const offset = -acumulado * circunferencia;
              acumulado += proporcao;
              if (fatia.valor === 0) return null;
              return (
                <circle
                  key={fatia.label}
                  cx={tamanho / 2}
                  cy={tamanho / 2}
                  r={raio}
                  fill="none"
                  stroke={fatia.cor}
                  strokeWidth={espessura}
                  strokeDasharray={`${traco} ${circunferencia - traco}`}
                  strokeDashoffset={offset}
                />
              );
            })}
        </g>
      </svg>
      {centro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centro}
        </div>
      )}
    </div>
  );
}
