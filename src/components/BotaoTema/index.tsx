"use client";

import { Moon, Sun } from "lucide-react";
import { useTema } from "@/components/TemaProvider";

export default function BotaoTema() {
  const { tema, alternar } = useTema();
  const claro = tema === "claro";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={claro ? "Ativar tema escuro" : "Ativar tema claro"}
      aria-pressed={claro}
      title={claro ? "Ativar tema escuro" : "Ativar tema claro"}
      className="text-texto-suave hover:text-texto transition-colors p-2 rounded-md hover:bg-realce cursor-pointer"
    >
      {claro ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
