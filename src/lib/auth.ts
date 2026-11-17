
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "@/lib/db";
import { enviarEmailCadastro } from "@/lib/email";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

export const googleHabilitado = Boolean(
  googleClientId && googleClientSecret
);

export const auth = betterAuth({
  database: prismaAdapter(getPrisma(), {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: googleHabilitado
    ? {
        google: {
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
        },
      }
    : undefined,

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await enviarEmailCadastro({
              nome: user.name,
              email: user.email,
            });
          } catch (erro) {
            console.error("[auth] falha ao enviar e-mail de cadastro:", erro);
          }
        },
      },
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
