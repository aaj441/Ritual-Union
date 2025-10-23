import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const updateStatus = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      sessionId: z.number(),
      status: z.enum(["focusing", "on_break", "offline"]),
      currentActivity: z.string().optional(),
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

    // Find participant
    const participant = await db.bodyDoublingParticipant.findFirst({
      where: {
        sessionId: input.sessionId,
        userId,
      },
    });

    if (!participant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Not a participant in this session",
      });
    }

    // Update status
    const updated = await db.bodyDoublingParticipant.update({
      where: { id: participant.id },
      data: {
        status: input.status,
        currentActivity: input.currentActivity,
        lastActiveAt: new Date(),
      },
    });

    return { participant: updated };
  });
