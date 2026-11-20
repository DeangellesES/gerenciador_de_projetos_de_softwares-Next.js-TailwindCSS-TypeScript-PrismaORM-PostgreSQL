type EntradaLimite = {
  count: number;
  expiraEm: number;
};

type ResultadoLimite = {
  permitido: boolean;
  restantes: number;
  retryAfterMs: number;
};

const limites = new Map<string, Map<string, EntradaLimite>>();
const LIMITE_MEMORIA = 5000;

function obterMapa(nome: string) {
  const mapa = limites.get(nome) ?? new Map<string, EntradaLimite>();

  if (!limites.has(nome)) {
    limites.set(nome, mapa);
  }

  return mapa;
}

function removerExpirados(mapa: Map<string, EntradaLimite>, agora: number) {
  if (mapa.size <= LIMITE_MEMORIA) {
    return;
  }

  for (const [chave, entrada] of mapa) {
    if (entrada.expiraEm <= agora) {
      mapa.delete(chave);
    }
  }
}

export function consultarLimite(
  nome: string,
  chave: string,
  max: number,
  janelaMs: number,
  agora = Date.now(),
): ResultadoLimite {
  const mapa = obterMapa(nome);
  removerExpirados(mapa, agora);
  const entrada = mapa.get(chave);

  if (!entrada || entrada.expiraEm <= agora) {
    return { permitido: true, restantes: max, retryAfterMs: 0 };
  }

  return {
    permitido: entrada.count < max,
    restantes: Math.max(0, max - entrada.count),
    retryAfterMs: Math.max(0, entrada.expiraEm - agora),
  };
}

export function consumirLimite(
  nome: string,
  chave: string,
  max: number,
  janelaMs: number,
  agora = Date.now(),
): ResultadoLimite {
  const mapa = obterMapa(nome);
  removerExpirados(mapa, agora);
  const entrada = mapa.get(chave);

  if (!entrada || entrada.expiraEm <= agora) {
    mapa.set(chave, { count: 1, expiraEm: agora + janelaMs });

    return { permitido: true, restantes: max - 1, retryAfterMs: 0 };
  }

  if (entrada.count >= max) {
    return {
      permitido: false,
      restantes: 0,
      retryAfterMs: Math.max(0, entrada.expiraEm - agora),
    };
  }

  entrada.count += 1;

  return {
    permitido: true,
    restantes: Math.max(0, max - entrada.count),
    retryAfterMs: 0,
  };
}

export function reiniciarLimite(nome: string, chave: string) {
  obterMapa(nome).delete(chave);
}

export function zerarLimites() {
  limites.clear();
}
