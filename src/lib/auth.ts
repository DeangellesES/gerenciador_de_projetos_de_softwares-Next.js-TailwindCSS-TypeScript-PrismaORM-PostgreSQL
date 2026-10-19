import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getPrisma } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(getPrisma(), {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = String(ctx.body?.email ?? "").trim().toLowerCase();

        if (!email.endsWith(".com")) {
          throw new APIError("BAD_REQUEST", {
            message: "O e-mail deve terminar com .com",
          });
        }
      }
    }),
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (usuario) => {
          await getPrisma().projeto.updateMany({
            where: { userId: null },
            data: { userId: usuario.id },
          });
        },
      },
    },
  },
});

export type Sessao = typeof auth.$Infer.Session;
