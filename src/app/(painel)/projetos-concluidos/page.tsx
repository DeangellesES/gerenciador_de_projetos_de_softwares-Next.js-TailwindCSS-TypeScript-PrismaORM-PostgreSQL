import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { porStatus } from "@/lib/projetos";

export const metadata: Metadata = {
  title: "Projetos Concluídos",
};

export default function PaginaProjetosConcluidos() {
  return (
    <ListaProjetos
      titulo="Projetos Concluídos"
      descricao="Trabalhos finalizados e disponíveis no portfólio."
      projetos={porStatus("concluido")}
    />
  );
}
