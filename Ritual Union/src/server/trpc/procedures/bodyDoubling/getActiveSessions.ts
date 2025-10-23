import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getActiveSessions = baseProcedure
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

    // Get active sessions
    const sessions = await db.bodyDoublingSession.findMany({
      where: {
        endedAt: null,
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
      orderBy: {
        startedAt: "desc",
      },
    });

    return {
      sessions: sessions.map(s => ({
        id: s.id,
        name: s.name,
        maxParticipants: s.maxParticipants,
        currentParticipants: s.participants.length,
        startedAt: s.startedAt,
        participants: s.participants.map(p => ({
          userId: p.userId,
          userName: p.user.name,
          status: p.status,
        })),
      })),
    };
  });
