"use client";

import { Plus } from "lucide-react";
import FormularioProjeto from "@/components/FormularioProjeto";
import type { StatusProjeto } from "@/lib/projetos";

type BotaoNovoProjetoProps = {
  rotulo: string;
  statusPadrao?: StatusProjeto;
  mostrarStatus?: boolean;
};

export default function BotaoNovoProjeto({
  rotulo,
  statusPadrao,
  mostrarStatus,
}: BotaoNovoProjetoProps) {
  return (
    <FormularioProjeto statusPadrao={statusPadrao} mostrarStatus={mostrarStatus}>
      <button
        type="button"
        className="text-white bg-blue-400 py-2 px-4 rounded-md flex gap-1 items-center cursor-pointer"
      >
        <Plus />
        {rotulo}
      </button>
    </FormularioProjeto>
  );
}
