import { consumirLimite, consultarLimite, reiniciarLimite } from "@/lib/limite-taxa";

const NOME_LIMITE = "login";
const MAX_TENTATIVAS = 5;
const JANELA_MS = 15 * 60 * 1000;

export function chaveTentativa(email: string, ip: string) {
  return `${ip}:${email.trim().toLowerCase()}`;
}

export function loginBloqueado(email: string, ip: string) {
  return !consultarLimite(
    NOME_LIMITE,
    chaveTentativa(email, ip),
    MAX_TENTATIVAS,
    JANELA_MS,
  ).permitido;
}

export function registrarFalhaLogin(email: string, ip: string) {
  return consumirLimite(
    NOME_LIMITE,
    chaveTentativa(email, ip),
    MAX_TENTATIVAS,
    JANELA_MS,
  );
}

export function registrarSucessoLogin(email: string, ip: string) {
  reiniciarLimite(NOME_LIMITE, chaveTentativa(email, ip));
}
