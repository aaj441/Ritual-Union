import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const updateRitual = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      ritualId: z.number(),
      name: z.string().optional(),
      type: z.enum(["focus", "break", "reflection", "custom"]).optional(),
      duration: z.number().min(1).max(240).optional(),
      soundscapeId: z.number().nullable().optional(),
      voiceGuidance: z.boolean().optional(),
      healthAdaptive: z.boolean().optional(),
      scheduleEnabled: z.boolean().optional(),
      scheduleCron: z.string().nullable().optional(),
      orderIndex: z.number().optional(),
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

    // Check ritual exists and belongs to user
    const ritual = await db.ritual.findUnique({
      where: { id: input.ritualId },
    });

    if (!ritual) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Ritual not found",
      });
    }

    if (ritual.userId !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to update this ritual",
      });
    }

    // Build update data object
    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.soundscapeId !== undefined) updateData.soundscapeId = input.soundscapeId;
    if (input.voiceGuidance !== undefined) updateData.voiceGuidance = input.voiceGuidance;
    if (input.healthAdaptive !== undefined) updateData.healthAdaptive = input.healthAdaptive;
    if (input.scheduleEnabled !== undefined) updateData.scheduleEnabled = input.scheduleEnabled;
    if (input.scheduleCron !== undefined) updateData.scheduleCron = input.scheduleCron;
    if (input.orderIndex !== undefined) updateData.orderIndex = input.orderIndex;

    // Update ritual
    const updatedRitual = await db.ritual.update({
      where: { id: input.ritualId },
      data: updateData,
      include: {
        soundscape: true,
      },
    });

    return {
      ritual: updatedRitual,
    };
  });
