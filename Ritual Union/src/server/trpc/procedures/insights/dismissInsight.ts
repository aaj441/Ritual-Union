import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const dismissInsight = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      insightId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    // Verify auth token
    let userId: number;
    try {
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ userId: z.number() }).parse(verified);
      userId = parsed.userId;
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid auth token",
      });
    }

    // Check insight exists and belongs to user
    const insight = await db.insight.findUnique({
      where: { id: input.insightId },
    });

    if (!insight) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Insight not found",
      });
    }

    if (insight.userId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to dismiss this insight",
      });
    }

    // Mark as dismissed
    await db.insight.update({
      where: { id: input.insightId },
      data: { dismissed: true },
    });

    return {
      success: true,
    };
  });
