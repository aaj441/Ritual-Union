import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const createSession = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      name: z.string(),
      maxParticipants: z.number().min(2).max(20).default(10),
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

    // Create body doubling session
    const session = await db.bodyDoublingSession.create({
      data: {
        name: input.name,
        maxParticipants: input.maxParticipants,
        participants: {
          create: {
            userId,
            status: "focusing",
            currentActivity: "Getting started",
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return { session };
  });
