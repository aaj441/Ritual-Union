import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { verifyAuthToken } from "../auth/verifyToken";

export const getRituals = baseProcedure
  .input(z.object({ authToken: z.string() }))
  .query(async ({ input }) => {
    const userId = await verifyAuthToken(input.authToken);

    const rituals = await db.ritual.findMany({
      where: { userId },
      include: {
        soundscape: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return rituals;
  });
