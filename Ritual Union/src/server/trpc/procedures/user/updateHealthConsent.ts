import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const updateHealthConsent = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      consent: z.boolean(),
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

    // Update user consent
    await db.user.update({
      where: { id: userId },
      data: { healthDataConsent: input.consent },
    });

    // If revoking consent, optionally delete health snapshots
    if (!input.consent) {
      // For now, we'll keep the data but mark consent as false
      // In production, you might want to delete or anonymize the data
      // await db.healthSnapshot.deleteMany({ where: { userId } });
    }

    return {
      success: true,
      consent: input.consent,
    };
  });
