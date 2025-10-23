import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const deleteRitual = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      ritualId: z.number(),
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

    // Check ritual exists and belongs to user
    const ritual = await db.ritual.findUnique({
      where: { id: input.ritualId },
    });

    if (!ritual) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Ritual not found",
      });
    }

    if (ritual.userId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to delete this ritual",
      });
    }

    // Delete ritual (cascade will handle related sessions)
    await db.ritual.delete({
      where: { id: input.ritualId },
    });

    return {
      success: true,
    };
  });
