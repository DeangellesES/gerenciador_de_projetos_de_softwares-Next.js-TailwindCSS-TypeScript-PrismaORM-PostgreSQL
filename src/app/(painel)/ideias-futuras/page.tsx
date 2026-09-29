import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { listarProjetos } from "@/lib/repositorio-projetos";

export const metadata: Metadata = {
  title: "Ideias Futuras",
};

export default async function PaginaIdeiasFuturas() {
  const projetos = await listarProjetos({ status: "ideia" });

  return (
    <ListaProjetos
      titulo="Ideias Futuras"
      descricao="Ideias guardadas para quando houver tempo e motivation."
      botao="Nova Ideia"
      statusPadrao="ideia"
      projetos={projetos}
    />
  );
}
