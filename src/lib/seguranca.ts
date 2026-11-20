export function ipDeCabecalhos(cabecalhos: Headers) {
  const encaminhado = cabecalhos
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  return (
    encaminhado ||
    cabecalhos.get("x-real-ip")?.trim() ||
    cabecalhos.get("cf-connecting-ip")?.trim() ||
    "desconhecido"
  );
}

function origensPermitidas(request: Request) {
  const origens = [new URL(request.url).origin];
  const urlBase = process.env.BETTER_AUTH_URL?.trim();

  if (urlBase) {
    try {
      origens.push(new URL(urlBase).origin);
    } catch {
      origens.push(urlBase);
    }
  }

  return origens;
}

export function origemPermitida(request: Request) {
  const tipoBusca = request.headers.get("sec-fetch-site");

  if (tipoBusca && tipoBusca !== "same-origin" && tipoBusca !== "none") {
    return false;
  }

  const origem = request.headers.get("origin");

  if (!origem) {
    return true;
  }

  try {
    const origemUrl = new URL(origem);

    return origensPermitidas(request).some((permitida) => {
      try {
        return origemUrl.origin === new URL(permitida).origin;
      } catch {
        return origemUrl.origin === permitida;
      }
    });
  } catch {
    return false;
  }
}

export function metodoModificaEstado(metodo: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(metodo.toUpperCase());
}
