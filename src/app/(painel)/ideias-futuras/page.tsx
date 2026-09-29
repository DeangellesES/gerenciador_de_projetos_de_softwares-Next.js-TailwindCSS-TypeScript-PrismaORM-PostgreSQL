import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { porStatus } from "@/lib/projetos";

export const metadata: Metadata = {
  title: "Ideias Futuras",
};

export default function PaginaIdeiasFuturas() {
  return (
    <ListaProjetos
      titulo="Ideias Futuras"
      descricao="Ideias guardadas para quando houver tempo e motivation."
      botao="Nova Ideia"
      projetos={porStatus("ideia")}
    />
  );
}
