import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getInsights = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      type: z.enum(["pattern", "recommendation", "celebration"]).optional(),
      includeDismissed: z.boolean().default(false),
      limit: z.number().min(1).max(50).default(10),
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
    if (input.type) {
      where.type = input.type;
    }
    if (!input.includeDismissed) {
      where.dismissed = false;
    }

    // Fetch insights
    const insights = await db.insight.findMany({
      where,
      orderBy: { generatedAt: "desc" },
      take: input.limit,
    });

    return {
      insights,
    };
  });
