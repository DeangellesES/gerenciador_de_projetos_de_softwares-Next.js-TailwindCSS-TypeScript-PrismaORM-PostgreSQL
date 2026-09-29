import Link from "next/link";
import { CircleCheck, FolderOpenDot, Lightbulb } from "lucide-react";
import { porStatus, type StatusProjeto } from "@/lib/projetos";

const secoes: {
  href: string;
  titulo: string;
  descricao: string;
  status: StatusProjeto;
  Icone: typeof FolderOpenDot;
}[] = [
  {
    href: "/projetos",
    titulo: "Meus Projetos",
    descricao: "Projetos em desenvolvimento, com progresso e prazo atualizados.",
    status: "ativo",
    Icone: FolderOpenDot,
  },
  {
    href: "/projetos-concluidos",
    titulo: "Projetos Concluídos",
    descricao: "Trabalhos finalizados e disponíveis no portfólio.",
    status: "concluido",
    Icone: CircleCheck,
  },
  {
    href: "/ideias-futuras",
    titulo: "Ideias Futuras",
    descricao: "Ideias guardadas para quando houver tempo e motivation.",
    status: "ideia",
    Icone: Lightbulb,
  },
];

export default function VisaoGeral() {
  const resumo = secoes.map((secao) => ({
    ...secao,
    total: porStatus(secao.status).length,
  }));

  return (
    <div className="px-10 py-8 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-white text-2xl font-bold">Visão Geral</h1>
        <p className="text-[#94A3B8] text-sm">
          Resumo dos {porStatus("ativo").length + porStatus("concluido").length + porStatus("ideia").length} projetos registrados.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resumo.map(({ href, titulo, descricao, total, Icone }) => (
          <Link
            key={href}
            href={href}
            className="bg-[#131B2E] border border-white/10 rounded-xl p-5 flex flex-col gap-3 transition-colors hover:border-white/25"
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold flex items-center gap-2">
                <Icone size={20} />
                {titulo}
              </span>
              <span className="text-3xl font-bold text-[#7DD3FC]">{total}</span>
            </div>
            <p className="text-[#94A3B8] text-sm">{descricao}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
