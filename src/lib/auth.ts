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
