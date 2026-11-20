import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@/generated/prisma/client";
import { consultarLimite } from "@/lib/limite-taxa";
import { ipDeCabecalhos } from "@/lib/seguranca";

const chaveDev = process.env.DEV_API_KEY?.trim();
const devHabilitado =
  process.env.NODE_ENV !== "production" && (chaveDev?.length ?? 0) >= 32;

export const CamposUsuario = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type UsuarioDev = Pick<User, keyof typeof CamposUsuario>;

type DadosAtualizacao = Partial<
  Pick<User, "name" | "email" | "emailVerified" | "image">
>;

type ResultadoValidacao =
  | { ok: true; dados: DadosAtualizacao }
  | { ok: false; erro: string };

function chaveDoBearer(valor: string | null) {
  if (!valor) {
    return undefined;
  }

  const texto = valor.trim();
  const correspondencia = /^Bearer\s+(.+)$/i.exec(texto);

  return correspondencia?.[1]?.trim() ?? texto;
}

export function autorizarDev(request: NextRequest): NextResponse | null {
  if (!devHabilitado || !chaveDev) {
    return NextResponse.json(
      { erro: "Rotas de desenvolvedor desabilitadas." },
      { status: 404 },
    );
  }

  const limite = consultarLimite(
    "dev",
    ipDeCabecalhos(request.headers),
    60,
    60_000,
  );

  if (!limite.permitido) {
    return NextResponse.json(
      { erro: "Muitas requisições. Tente novamente mais tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limite.retryAfterMs / 1000)),
        },
      },
    );
  }

  const candidatas = [
    request.headers.get("x-dev-key"),
    chaveDoBearer(request.headers.get("authorization")),
  ]
    .map((valor) => valor?.trim())
    .filter((valor): valor is string => Boolean(valor));

  if (candidatas.length === 0) {
    return NextResponse.json(
      { erro: "Chave ausente. Envie x-dev-key no header." },
      { status: 401 },
    );
  }

  const esperada = Buffer.from(chaveDev, "utf8");
  const autorizada = candidatas.some((candidata) => {
    const fornecida = Buffer.from(candidata, "utf8");

    return (
      esperada.length === fornecida.length &&
      timingSafeEqual(esperada, fornecida)
    );
  });

  if (!autorizada) {
    return NextResponse.json(
      { erro: "Chave de desenvolvedor inválida." },
      { status: 401 },
    );
  }

  return null;
}

function decodificar(valor: string) {
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}

export function filtroPorIdentificador(identificador: string) {
  const valor = decodificar(identificador).trim();

  return valor.includes("@")
    ? { email: { equals: valor, mode: "insensitive" as const } }
    : { id: valor };
}

export function validarAtualizacao(corpo: unknown): ResultadoValidacao {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    return { ok: false, erro: "Corpo JSON inválido." };
  }

  const campos = corpo as Record<string, unknown>;
  const permitidos = ["name", "email", "emailVerified", "image"];
  const desconhecidos = Object.keys(campos).filter(
    (campo) => !permitidos.includes(campo),
  );

  if (desconhecidos.length > 0) {
    if (desconhecidos.includes("password")) {
      return {
        ok: false,
        erro: "Senha não pode ser alterada por aqui; use o fluxo do Better Auth.",
      };
    }

    return {
      ok: false,
      erro: `Campos não permitidos: ${desconhecidos.join(", ")}.`,
    };
  }

  const dados: DadosAtualizacao = {};

  if ("name" in campos) {
    if (typeof campos.name !== "string" || !campos.name.trim()) {
      return { ok: false, erro: "O campo name deve ser um texto não vazio." };
    }
    dados.name = campos.name.trim();
  }

  if ("email" in campos) {
    if (
      typeof campos.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email.trim())
    ) {
      return { ok: false, erro: "O campo email é inválido." };
    }
    dados.email = campos.email.trim().toLowerCase();
  }

  if ("emailVerified" in campos) {
    if (typeof campos.emailVerified !== "boolean") {
      return { ok: false, erro: "O campo emailVerified deve ser booleano." };
    }
    dados.emailVerified = campos.emailVerified;
  }

  if ("image" in campos) {
    if (campos.image === null) {
      dados.image = null;
    } else if (typeof campos.image === "string") {
      dados.image = campos.image.trim() || null;
    } else {
      return { ok: false, erro: "O campo image deve ser texto ou null." };
    }
  }

  if (Object.keys(dados).length === 0) {
    return {
      ok: false,
      erro: "Informe ao menos um dos campos: name, email, emailVerified, image.",
    };
  }

  return { ok: true, dados };
}
