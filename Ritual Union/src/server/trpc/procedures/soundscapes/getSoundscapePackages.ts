import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getSoundscapePackages = baseProcedure
  .input(
    z.object({
      authToken: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    // Optional auth - public can view, but purchased status requires auth
    let userId: number | null = null;
    if (input.authToken) {
      try {
        const verified = jwt.verify(input.authToken, env.JWT_SECRET);
        const parsed = z.object({ userId: z.number() }).parse(verified);
        userId = parsed.userId;
      } catch (error) {
        // Invalid token, proceed as guest
      }
    }

    // Get all packs with their soundscapes
    const packs = await db.soundscapePack.findMany({
      include: {
        soundscapes: {
          include: {
            soundscape: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        purchases: userId ? {
          where: { userId },
        } : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response
    const formattedPacks = packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      price: pack.price,
      isPremium: pack.isPremium,
      imageUrl: pack.imageUrl,
      soundscapeCount: pack.soundscapes.length,
      isPurchased: userId ? pack.purchases && pack.purchases.length > 0 : false,
      soundscapes: pack.soundscapes.map((item) => item.soundscape),
    }));

    return {
      packs: formattedPacks,
    };
  });
