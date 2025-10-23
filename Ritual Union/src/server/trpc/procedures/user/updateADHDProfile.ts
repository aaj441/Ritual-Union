import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const updateADHDProfile = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      diagnosisStatus: z.enum(["diagnosed", "self_identified", "exploring"]).optional(),
      primaryChallenges: z.array(z.string()).optional(),
      accommodations: z.array(z.string()).optional(),
      triggerWarnings: z.array(z.string()).optional(),
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

    // Check if profile exists
    const existingProfile = await db.aDHDProfile.findUnique({
      where: { userId },
    });

    // Build update data
    const updateData: any = {};
    if (input.diagnosisStatus) updateData.diagnosisStatus = input.diagnosisStatus;
    if (input.primaryChallenges) updateData.primaryChallenges = input.primaryChallenges;
    if (input.accommodations) updateData.accommodations = input.accommodations;
    if (input.triggerWarnings) updateData.triggerWarnings = input.triggerWarnings;

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await db.aDHDProfile.update({
        where: { userId },
        data: updateData,
      });
    } else {
      // Create new profile
      profile = await db.aDHDProfile.create({
        data: {
          userId,
          diagnosisStatus: input.diagnosisStatus || "exploring",
          primaryChallenges: input.primaryChallenges || [],
          accommodations: input.accommodations || [],
          triggerWarnings: input.triggerWarnings || [],
        },
      });
    }

    return {
      profile,
    };
  });
