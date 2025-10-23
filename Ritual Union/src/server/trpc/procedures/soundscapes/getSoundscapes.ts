import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getSoundscapes = baseProcedure
  .input(
    z.object({
      category: z.string().optional(),
      premiumOnly: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    const soundscapes = await db.soundscape.findMany({
      where: {
        ...(input.category ? { category: input.category } : {}),
        ...(input.premiumOnly !== undefined
          ? { isPremium: input.premiumOnly }
          : {}),
      },
      orderBy: { name: "asc" },
    });

    return soundscapes;
  });
