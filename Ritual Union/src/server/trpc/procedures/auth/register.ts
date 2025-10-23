import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const register = baseProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8, "Password must be at least 8 characters"),
      name: z.string().min(1, "Name is required"),
      timezone: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(input.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        timezone: input.timezone || "UTC",
      },
    });

    // Generate JWT token
    const authToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "1y",
    });

    return {
      authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
    };
  });
