import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { verifyAuthToken } from "../auth/verifyToken";

export const getSessionHistory = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    const userId = await verifyAuthToken(input.authToken);

    const sessions = await db.focusSession.findMany({
      where: {
        userId,
        ...(input.cursor ? { id: { lt: input.cursor } } : {}),
      },
      include: {
        ritual: {
          include: {
            soundscape: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
      take: input.limit + 1,
    });

    let nextCursor: number | undefined = undefined;
    if (sessions.length > input.limit) {
      const nextItem = sessions.pop();
      nextCursor = nextItem!.id;
    }

    return {
      sessions,
      nextCursor,
    };
  });
