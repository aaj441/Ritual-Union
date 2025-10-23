import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { verifyAuthToken } from "../auth/verifyToken";

export const completeSession = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      sessionId: z.number(),
      completed: z.boolean(),
      hrvEnd: z.number().optional(),
      avgHeartRate: z.number().optional(),
      userRating: z.number().min(1).max(5).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = await verifyAuthToken(input.authToken);

    // Verify session belongs to user
    const session = await db.focusSession.findFirst({
      where: {
        id: input.sessionId,
        userId,
      },
    });

    if (!session) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Session not found",
      });
    }

    const endedAt = new Date();
    const actualDuration = Math.floor(
      (endedAt.getTime() - session.startedAt.getTime()) / 1000 / 60
    );

    const updatedSession = await db.focusSession.update({
      where: { id: input.sessionId },
      data: {
        endedAt,
        actualDuration,
        completed: input.completed,
        hrvEnd: input.hrvEnd,
        avgHeartRate: input.avgHeartRate,
        userRating: input.userRating,
      },
    });

    return updatedSession;
  });
