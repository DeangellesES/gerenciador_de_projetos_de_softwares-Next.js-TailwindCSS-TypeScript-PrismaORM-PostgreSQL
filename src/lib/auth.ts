import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(getPrisma(), {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    cookies: {
      session_token: {
        name: "gerenciador.session_token",
      },
    },
  },
});

export type Sessao = typeof auth.$Infer.Session;
