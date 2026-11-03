export type ResultadoApi<T> =
  | { ok: true; dados: T }
  | { ok: false; erro: string };

const ERRO_CONEXAO = "Falha de conexão com o servidor.";
const ERRO_PADRAO = "Não foi possível concluir a operação.";

function extrairMensagem(corpo: unknown, padrao: string): string {
  if (typeof corpo === "object" && corpo !== null && "erro" in corpo) {
    const mensagem = (corpo as { erro?: unknown }).erro;

    if (typeof mensagem === "string" && mensagem.trim()) {
      return mensagem;
    }
  }

  return padrao;
}

export async function requisitarApi<T>(
  url: string,
  init?: RequestInit,
  mensagemPadrao = ERRO_PADRAO,
): Promise<ResultadoApi<T>> {
  try {
    const resposta = await fetch(url, init);
    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      return { ok: false, erro: extrairMensagem(corpo, mensagemPadrao) };
    }

    return { ok: true, dados: corpo as T };
  } catch {
    return { ok: false, erro: ERRO_CONEXAO };
  }
}

export function enviarJson<T>(
  url: string,
  metodo: "POST" | "PATCH",
  corpo: unknown,
  mensagemPadrao?: string,
): Promise<ResultadoApi<T>> {
  return requisitarApi<T>(
    url,
    {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    },
    mensagemPadrao,
  );
}
