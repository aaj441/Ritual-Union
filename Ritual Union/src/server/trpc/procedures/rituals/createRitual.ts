import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { verifyAuthToken } from "../auth/verifyToken";

export const createRitual = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      name: z.string().min(1, "Name is required"),
      type: z.enum(["focus", "break", "reflection", "custom"]),
      duration: z.number().min(1).max(180), // 1-180 minutes
      soundscapeId: z.number().optional(),
      voiceGuidance: z.boolean().default(false),
      healthAdaptive: z.boolean().default(false),
      scheduleEnabled: z.boolean().default(false),
      scheduleCron: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = await verifyAuthToken(input.authToken);

    const ritual = await db.ritual.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        duration: input.duration,
        soundscapeId: input.soundscapeId,
        voiceGuidance: input.voiceGuidance,
        healthAdaptive: input.healthAdaptive,
        scheduleEnabled: input.scheduleEnabled,
        scheduleCron: input.scheduleCron,
      },
      include: {
        soundscape: true,
      },
    });

    return ritual;
  });
