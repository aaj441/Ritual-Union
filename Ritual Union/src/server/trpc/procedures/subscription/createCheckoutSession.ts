import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const createCheckoutSession = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      tier: z.enum(["flow", "deep", "master"]),
      promoCode: z.string().optional(),
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

    if (!env.STRIPE_SECRET_KEY) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe is not configured",
      });
    }

    // Get user
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

    // Check if user already has an active subscription
    if (user.subscription?.status === "active") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You already have an active subscription",
      });
    }

    // Validate promo code if provided
    let discount = null;
    if (input.promoCode) {
      const promoCode = await db.promoCode.findUnique({
        where: { code: input.promoCode },
      });

      if (!promoCode || !promoCode.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid promo code",
        });
      }

      if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Promo code has expired",
        });
      }

      if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Promo code has reached maximum uses",
        });
      }

      discount = {
        type: promoCode.discountType,
        value: promoCode.discountValue,
      };
    }

    // Price mapping (in cents)
    const prices = {
      flow: 999, // $9.99/month
      deep: 1999, // $19.99/month
      master: 4999, // $49.99/month
    };

    const price = prices[input.tier];

    // For now, return a mock checkout URL since we need Stripe SDK integration
    // In production, this would create an actual Stripe checkout session
    const mockCheckoutUrl = `https://checkout.stripe.com/mock/${input.tier}`;

    return {
      checkoutUrl: mockCheckoutUrl,
      tier: input.tier,
      price,
      discount,
    };
  });
