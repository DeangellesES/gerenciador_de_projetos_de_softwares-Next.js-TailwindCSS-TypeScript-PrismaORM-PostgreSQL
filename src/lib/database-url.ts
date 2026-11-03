const variaveisComPool = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "DATABASE_URL_POOLED",
] as const;

const variaveisSemPool = [
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
] as const;

function primeiraDefinida(nomes: readonly string[]): string | undefined {
  for (const nome of nomes) {
    const valor = process.env[nome]?.trim();

    if (valor) {
      return valor;
    }
  }

  return undefined;
}

export function obterDatabaseUrl(): string | undefined {
  return primeiraDefinida(variaveisComPool) ?? primeiraDefinida(variaveisSemPool);
}
