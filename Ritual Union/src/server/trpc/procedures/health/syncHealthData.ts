import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const syncHealthData = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      source: z.enum([
        "apple_health",
        "android_health",
        "fitbit",
        "oura",
        "google_fit",
        "samsung_health",
        "manual",
      ]),
      timestamp: z.string().datetime().optional(),
      hrv: z.number().optional(),
      sleepDuration: z.number().optional(), // hours
      sleepQuality: z.number().min(0).max(100).optional(),
      activeEnergy: z.number().optional(), // calories
      mindfulMinutes: z.number().optional(),
      steps: z.number().optional(),
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

    // Check user has consented to health data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { healthDataConsent: true },
    });

    if (!user?.healthDataConsent) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Health data consent required",
      });
    }

    // Create health snapshot
    const snapshot = await db.healthSnapshot.create({
      data: {
        userId,
        source: input.source,
        timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
        hrv: input.hrv,
        sleepDuration: input.sleepDuration,
        sleepQuality: input.sleepQuality,
        activeEnergy: input.activeEnergy,
        mindfulMinutes: input.mindfulMinutes,
        steps: input.steps,
      },
    });

    return {
      snapshot,
    };
  });
