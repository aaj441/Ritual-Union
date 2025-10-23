import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const cancelSubscription = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      cancelAtPeriodEnd: z.boolean().default(true),
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

    // Get user with subscription
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active subscription found",
      });
    }

    // Update subscription
    await db.subscription.update({
      where: { id: user.subscription.id },
      data: {
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        status: input.cancelAtPeriodEnd ? "active" : "canceled",
      },
    });

    // In production, this would also call Stripe API to cancel the subscription

    return {
      success: true,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd,
    };
  });
