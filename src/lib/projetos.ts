export const STATUS_PROJETO = ["ativo", "concluido", "ideia"] as const;

export type StatusProjeto = (typeof STATUS_PROJETO)[number];

export const ROTULOS_STATUS: Record<StatusProjeto, string> = {
  ativo: "Em andamento",
  concluido: "Concluído",
  ideia: "Ideia",
};

export const ROTULOS_STATUS_NOVO_PROJETO: Record<StatusProjeto, string> = {
  ativo: "Em andamento",
  concluido: "Iniciando",
  ideia: "Finalizando",
};

export type Projeto = {
  id: string;
  nome: string;
  descricao: string;
  status: StatusProjeto;
  stack: string[];
  progresso: number | null;
  prazo: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type DadosProjeto = {
  nome: string;
  descricao: string;
  status: StatusProjeto;
  stack: string[];
  progresso: number | null;
  prazo: Date | null;
};

export function ehStatusProjeto(valor: unknown): valor is StatusProjeto {
  return typeof valor === "string" && STATUS_PROJETO.includes(valor as StatusProjeto);
}

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function buscarProjetos(lista: Projeto[], termo: string): Projeto[] {
  const busca = normalizar(termo);

  if (!busca) {
    return lista;
  }

  const termos = busca.split(/\s+/).filter(Boolean);

  return lista.filter((projeto) => {
    const alvo = normalizar(
      [projeto.nome, projeto.descricao, ...projeto.stack].join(" "),
    );

    return termos.every((termoBusca) => alvo.includes(termoBusca));
  });
}

export function formatarData(data: Date | string): string {
  const valor = paraData(typeof data === "string" ? data : data.toISOString());

  if (!valor) {
    return "—";
  }

  return valor.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function paraData(iso: string | null | undefined): Date | null {
  if (!iso) {
    return null;
  }

  const data = new Date(iso);

  return Number.isNaN(data.getTime()) ? null : data;
}

export function paraTextoData(data: Date | null): string {
  return data ? data.toISOString().slice(0, 10) : "";
}

export function gerarSlug(texto: string): string {
  const slug = normalizar(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "projeto";
}
