import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getSubscriptionStatus = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
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

    // Get user with subscription
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Define feature access based on tier
    const tierFeatures = {
      free: {
        maxRituals: 3,
        premiumSoundscapes: false,
        healthAdaptive: false,
        voiceGuidance: false,
        analytics: false,
        aiInsights: false,
        bodyDoubling: false,
      },
      flow: {
        maxRituals: 10,
        premiumSoundscapes: true,
        healthAdaptive: true,
        voiceGuidance: false,
        analytics: true,
        aiInsights: true,
        bodyDoubling: false,
      },
      deep: {
        maxRituals: 50,
        premiumSoundscapes: true,
        healthAdaptive: true,
        voiceGuidance: true,
        analytics: true,
        aiInsights: true,
        bodyDoubling: true,
      },
      master: {
        maxRituals: -1, // unlimited
        premiumSoundscapes: true,
        healthAdaptive: true,
        voiceGuidance: true,
        analytics: true,
        aiInsights: true,
        bodyDoubling: true,
      },
    };

    const currentTier = user.subscription?.tier || user.subscriptionTier;
    const features = tierFeatures[currentTier as keyof typeof tierFeatures] || tierFeatures.free;

    return {
      tier: currentTier,
      status: user.subscription?.status || "free",
      features,
      subscription: user.subscription,
    };
  });
