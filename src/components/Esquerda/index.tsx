"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleCheck,
  FolderCode,
  FolderOpenDot,
  LayoutDashboard,
  Lightbulb,
} from "lucide-react";

const links = [
  { href: "/", rotulo: "Visão Geral", Icone: LayoutDashboard },
  { href: "/projetos", rotulo: "Meus Projetos", Icone: FolderOpenDot },
  {
    href: "/projetos-concluidos",
    rotulo: "Projetos Concluídos",
    Icone: CircleCheck,
  },
  { href: "/ideias-futuras", rotulo: "Ideias Futuras", Icone: Lightbulb },
];

export default function LadoEsquerdo() {
  const pathname = usePathname();

  return (
    <aside className="bg-[#131B2E] w-[20%] min-w-[15rem] h-screen shrink-0 flex flex-col border-r border-white/10">
      <div className="p-5 font-bold text-xl border-b border-gray-200/20">
        <Link
          href="/"
          className="text-white flex gap-3 items-center transition-colors hover:text-[#7DD3FC]"
        >
          <FolderCode size={50} />
          Gerenciador de Projetos
        </Link>
      </div>
      <nav className="px-6 space-y-5 pt-4">
        {links.map(({ href, rotulo, Icone }) => {
          const ativo = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={`flex gap-2 items-center pl-3 -ml-1 border-l-2 transition-colors ${
                ativo
                  ? "text-white border-[#7DD3FC]"
                  : "text-[#D1D5DB] border-transparent hover:text-white"
              }`}
            >
              <Icone size={20} />
              {rotulo}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
