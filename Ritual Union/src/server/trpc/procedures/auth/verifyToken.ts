import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";

export async function verifyAuthToken(authToken: string): Promise<number> {
  try {
    const verified = jwt.verify(authToken, env.JWT_SECRET);
    const parsed = z.object({ userId: z.number() }).parse(verified);
    return parsed.userId;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or expired authentication token",
    });
  }
}
