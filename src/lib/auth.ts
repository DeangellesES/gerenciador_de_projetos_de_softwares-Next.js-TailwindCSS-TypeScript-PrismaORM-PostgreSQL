
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "@/lib/db";
import {
  emailHabilitado,
  enviarEmailCadastro,
  enviarEmailVerificacao,
} from "@/lib/email";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const urlBase = process.env.BETTER_AUTH_URL?.trim();
const ambienteProducao = process.env.NODE_ENV === "production";

export const googleHabilitado = Boolean(
  googleClientId && googleClientSecret
);

const verificacaoConfigurada = process.env.EXIGIR_VERIFICACAO_EMAIL?.trim();

export const verificacaoEmailObrigatoria =
  emailHabilitado &&
  (verificacaoConfigurada === "true" ||
    (ambienteProducao && verificacaoConfigurada !== "false"));

export const auth = betterAuth({
  database: prismaAdapter(getPrisma(), {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: verificacaoEmailObrigatoria,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!emailHabilitado) {
        return;
      }

      await enviarEmailVerificacao({
        nome: user.name,
        email: user.email,
        url,
      });
    },
    sendOnSignUp: verificacaoEmailObrigatoria,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 30 * 60,
  },

  socialProviders: googleHabilitado
    ? {
        google: {
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
        },
      }
    : undefined,

  rateLimit: {
    enabled: true,
    storage: "memory",
    window: 10,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 15 * 60, max: 10 },
      "/sign-up/email": { window: 15 * 60, max: 5 },
      "/send-verification-email": { window: 15 * 60, max: 5 },
      "/request-password-reset": { window: 15 * 60, max: 5 },
    },
  },

  session: {
    expiresIn: 24 * 60 * 60,
    updateAge: 6 * 60 * 60,
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
            await enviarEmailCadastro(
              {
                nome: user.name,
                email: user.email,
              },
              verificacaoEmailObrigatoria,
            );
          } catch (erro) {
            console.error("[auth] falha ao enviar e-mail de cadastro", {
              nome: erro instanceof Error ? erro.name : "Erro",
              codigo: (erro as { code?: unknown }).code,
            });
          }
        },
      },
    },
  },

  advanced: {
    useSecureCookies: ambienteProducao || urlBase?.startsWith("https://") || false,
    disableCSRFCheck: false,
    disableOriginCheck: false,
    trustedOrigins: urlBase ? [urlBase] : undefined,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      session_token: {
        name: "gerenciador.session_token",
      },
    },
  },
});

export type Sessao = typeof auth.$Infer.Session;
