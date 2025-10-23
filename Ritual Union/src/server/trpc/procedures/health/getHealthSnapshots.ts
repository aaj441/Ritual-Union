import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getHealthSnapshots = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      limit: z.number().min(1).max(100).default(30),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    })
  )
  .query(async ({ input }) => {
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

    // Build where clause
    const where: any = { userId };
    if (input.startDate || input.endDate) {
      where.timestamp = {};
      if (input.startDate) {
        where.timestamp.gte = new Date(input.startDate);
      }
      if (input.endDate) {
        where.timestamp.lte = new Date(input.endDate);
      }
    }

    // Get snapshots
    const snapshots = await db.healthSnapshot.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: input.limit,
    });

    // Calculate aggregates
    const latestSnapshot = snapshots[0];
    const avgHrv = snapshots.filter(s => s.hrv).length > 0
      ? snapshots.reduce((sum, s) => sum + (s.hrv || 0), 0) / snapshots.filter(s => s.hrv).length
      : null;
    const avgSleepQuality = snapshots.filter(s => s.sleepQuality).length > 0
      ? snapshots.reduce((sum, s) => sum + (s.sleepQuality || 0), 0) / snapshots.filter(s => s.sleepQuality).length
      : null;

    return {
      snapshots,
      latest: latestSnapshot,
      aggregates: {
        avgHrv,
        avgSleepQuality,
      },
    };
  });
