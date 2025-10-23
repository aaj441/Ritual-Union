import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const reorderRituals = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      ritualIds: z.array(z.number()),
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

    // Verify all rituals belong to the user
    const rituals = await db.ritual.findMany({
      where: {
        id: { in: input.ritualIds },
        userId: userId,
      },
    });

    if (rituals.length !== input.ritualIds.length) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Some rituals do not belong to you or do not exist",
      });
    }

    // Update orderIndex for each ritual
    await Promise.all(
      input.ritualIds.map((ritualId, index) =>
        db.ritual.update({
          where: { id: ritualId },
          data: { orderIndex: index },
        })
      )
    );

    return {
      success: true,
    };
  });
