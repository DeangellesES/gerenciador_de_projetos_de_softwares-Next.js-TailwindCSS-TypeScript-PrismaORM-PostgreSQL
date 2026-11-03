import type { ReactNode } from "react";

type LadoDireitoProps = {
  children: ReactNode;
};

export default function LadoDireito({ children }: LadoDireitoProps) {
  return (
    <main className="bg-[#0B1326] flex-1 min-w-0 h-screen overflow-y-auto">
      {children}
    </main>
  );
}
