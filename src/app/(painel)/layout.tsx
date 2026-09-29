import type { ReactNode } from "react";
import LadoDireito from "@/components/Direita";
import LadoEsquerdo from "@/components/Esquerda";

export const dynamic = "force-dynamic";

export default function PainelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <LadoEsquerdo />
      <LadoDireito>{children}</LadoDireito>
    </div>
  );
}
