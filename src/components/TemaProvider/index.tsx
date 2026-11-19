"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Tema = "escuro" | "claro";

type TemaContexto = {
  tema: Tema;
  alternar: () => void;
};

const ContextoTema = createContext<TemaContexto | null>(null);
const EVENTO_TEMA = "tema-mudou";

function inscrever(callback: () => void) {
  window.addEventListener(EVENTO_TEMA, callback);
  return () => window.removeEventListener(EVENTO_TEMA, callback);
}

function obterTema(): Tema {
  return document.documentElement.classList.contains("claro")
    ? "claro"
    : "escuro";
}

function obterTemaServidor(): Tema {
  return "escuro";
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const tema = useSyncExternalStore(inscrever, obterTema, obterTemaServidor);

  const alternar = useCallback(() => {
    const proximo: Tema = obterTema() === "escuro" ? "claro" : "escuro";

    document.documentElement.classList.toggle("claro", proximo === "claro");

    try {
      window.localStorage.setItem("tema", proximo);
    } catch {
      return;
    }

    window.dispatchEvent(new Event(EVENTO_TEMA));
  }, []);

  return (
    <ContextoTema.Provider value={{ tema, alternar }}>
      {children}
    </ContextoTema.Provider>
  );
}

export function useTema() {
  const contexto = useContext(ContextoTema);

  if (!contexto) {
    throw new Error("useTema precisa ser usado dentro de TemaProvider.");
  }

  return contexto;
}
