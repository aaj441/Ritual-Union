import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const subscribeToSession = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      sessionId: z.number(),
    })
  )
  .subscription(async function* ({ input }) {
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

    let lastMessageId = 0;
    let lastParticipantUpdate = new Date();

    while (true) {
      // Fetch session data
      const session = await db.bodyDoublingSession.findUnique({
        where: { id: input.sessionId },
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
          messages: {
            where: {
              id: {
                gt: lastMessageId,
              },
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      // Check if there are new messages
      if (session.messages.length > 0) {
        lastMessageId = session.messages[session.messages.length - 1].id;
      }

      // Check if participants have updated
      const participantsUpdated = session.participants.some(
        p => p.lastActiveAt > lastParticipantUpdate
      );

      if (session.messages.length > 0 || participantsUpdated) {
        lastParticipantUpdate = new Date();
        
        yield {
          session: {
            id: session.id,
            name: session.name,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
          },
          participants: session.participants.map(p => ({
            id: p.id,
            userId: p.userId,
            userName: p.user.name,
            status: p.status,
            currentActivity: p.currentActivity,
            lastActiveAt: p.lastActiveAt,
          })),
          newMessages: session.messages.map(m => ({
            id: m.id,
            userId: m.userId,
            userName: m.user.name,
            message: m.message,
            type: m.type,
            createdAt: m.createdAt,
          })),
        };
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if session has ended
      if (session.endedAt) {
        break;
      }
    }
  });
