import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { porStatus } from "@/lib/projetos";

export const metadata: Metadata = {
  title: "Meus Projetos",
};

export default function PaginaProjetos() {
  return (
    <ListaProjetos
      titulo="Meus Projetos"
      descricao="Projetos em desenvolvimento, com progresso e prazo atualizados."
      projetos={porStatus("ativo")}
    />
  );
}
