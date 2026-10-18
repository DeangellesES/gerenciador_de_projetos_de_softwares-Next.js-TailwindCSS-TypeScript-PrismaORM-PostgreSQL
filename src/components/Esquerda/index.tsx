"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  CircleCheck,
  FolderCode,
  FolderOpenDot,
  LayoutDashboard,
  Lightbulb,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const links = [
  { href: "/", rotulo: "Visão Geral", Icone: LayoutDashboard },
  { href: "/projetos", rotulo: "Meus Projetos", Icone: FolderOpenDot },
  {
    href: "/projetos-concluidos",
    rotulo: "Projetos Finalizados",
    Icone: CircleCheck,
  },
  { href: "/ideias-futuras", rotulo: "Ideias Futuras", Icone: Lightbulb },
];

type Props = {
  usuario: { nome: string; email: string };
};

export default function LadoEsquerdo({ usuario }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const inicial = usuario.nome.trim().charAt(0).toUpperCase() || "U";

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

      <div className="mt-auto p-5 border-t border-white/10 flex items-center gap-3">
        <span className="w-9 h-9 shrink-0 rounded-full bg-sky-400/15 border border-sky-400/40 text-[#7DD3FC] font-semibold flex items-center justify-center">
          {inicial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-medium truncate">
            {usuario.nome}
          </p>
          <p className="text-[#94A3B8] text-xs truncate">{usuario.email}</p>
        </div>
        <button
          type="button"
          onClick={sair}
          disabled={saindo}
          title="Sair"
          className="text-[#D1D5DB] hover:text-white transition-colors p-2 rounded-md hover:bg-white/5 disabled:opacity-60"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
