import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const joinSession = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      sessionId: z.number(),
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

    // Check if session exists and has space
    const session = await db.bodyDoublingSession.findUnique({
      where: { id: input.sessionId },
      include: {
        participants: true,
      },
    });

    if (!session) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Session not found",
      });
    }

    if (session.endedAt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Session has ended",
      });
    }

    if (session.participants.length >= session.maxParticipants) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Session is full",
      });
    }

    // Check if already a participant
    const existingParticipant = session.participants.find(p => p.userId === userId);
    if (existingParticipant) {
      // Update last active time
      await db.bodyDoublingParticipant.update({
        where: { id: existingParticipant.id },
        data: { lastActiveAt: new Date() },
      });
      return { participant: existingParticipant };
    }

    // Add participant
    const participant = await db.bodyDoublingParticipant.create({
      data: {
        sessionId: input.sessionId,
        userId,
        status: "focusing",
        currentActivity: "Just joined",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { participant };
  });
