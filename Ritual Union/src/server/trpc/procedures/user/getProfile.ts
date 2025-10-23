import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { verifyAuthToken } from "../auth/verifyToken";

export const getProfile = baseProcedure
  .input(z.object({ authToken: z.string() }))
  .query(async ({ input }) => {
    const userId = await verifyAuthToken(input.authToken);

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        adhdProfile: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
      healthDataConsent: user.healthDataConsent,
      subscriptionTier: user.subscriptionTier,
      adhdProfile: user.adhdProfile,
    };
  });
