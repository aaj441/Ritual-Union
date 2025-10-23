import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const sendMessage = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      sessionId: z.number(),
      message: z.string().min(1).max(500),
      type: z.enum(["chat", "encouragement", "system"]).default("chat"),
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

    // Verify participant
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

    // Create message
    const message = await db.bodyDoublingMessage.create({
      data: {
        sessionId: input.sessionId,
        userId,
        message: input.message,
        type: input.type,
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

    return { message };
  });
