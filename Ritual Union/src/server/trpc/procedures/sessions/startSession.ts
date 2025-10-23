import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { verifyAuthToken } from "../auth/verifyToken";

export const startSession = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      ritualId: z.number(),
      plannedDuration: z.number(),
      hrvStart: z.number().optional(),
      sleepQualityPrior: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = await verifyAuthToken(input.authToken);

    // Verify ritual belongs to user
    const ritual = await db.ritual.findFirst({
      where: {
        id: input.ritualId,
        userId,
      },
    });

    if (!ritual) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Ritual not found",
      });
    }

    const session = await db.focusSession.create({
      data: {
        userId,
        ritualId: input.ritualId,
        plannedDuration: input.plannedDuration,
        hrvStart: input.hrvStart,
        sleepQualityPrior: input.sleepQualityPrior,
      },
    });

    return session;
  });
