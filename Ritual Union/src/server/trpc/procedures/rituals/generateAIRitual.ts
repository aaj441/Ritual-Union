import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

const ritualSuggestionSchema = z.object({
  rituals: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["focus", "break", "reflection", "custom"]),
      duration: z.number().min(5).max(180),
      reasoning: z.string(),
      bestTimeOfDay: z.string().optional(),
      soundscapeCategory: z.string().optional(),
      healthAdaptive: z.boolean(),
    })
  ),
});

export const generateAIRitual = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      goal: z.string().optional(),
      timeAvailable: z.number().optional(),
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

    // Fetch user data for personalization
    const [healthSnapshots, sessions, user, existingRituals, soundscapes] = await Promise.all([
      db.healthSnapshot.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: 14,
      }),
      db.focusSession.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 30,
        include: { ritual: true },
      }),
      db.user.findUnique({
        where: { id: userId },
        include: { adhdProfile: true },
      }),
      db.ritual.findMany({
        where: { userId },
      }),
      db.soundscape.findMany({
        select: { id: true, name: true, category: true, isPremium: true },
      }),
    ]);

    // Analyze user patterns
    const completedSessions = sessions.filter((s) => s.completed);
    const avgDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / completedSessions.length
      : 25;

    const sessionsByHour = sessions.reduce((acc, s) => {
      const hour = new Date(s.startedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const bestHours = Object.entries(sessionsByHour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const avgHrv = healthSnapshots.filter(s => s.hrv).length > 0
      ? healthSnapshots.reduce((sum, s) => sum + (s.hrv || 0), 0) / healthSnapshots.filter(s => s.hrv).length
      : null;

    const avgSleepQuality = healthSnapshots.filter(s => s.sleepQuality).length > 0
      ? healthSnapshots.reduce((sum, s) => sum + (s.sleepQuality || 0), 0) / healthSnapshots.filter(s => s.sleepQuality).length
      : null;

    // Prepare context for AI
    const context = `
User Profile:
- Total sessions completed: ${completedSessions.length}
- Average session duration: ${Math.round(avgDuration)} minutes
- ADHD profile: ${user?.adhdProfile ? 'Yes' : 'No'}
${user?.adhdProfile ? `- Primary challenges: ${user.adhdProfile.primaryChallenges.join(', ')}` : ''}
${user?.adhdProfile ? `- Accommodations: ${user.adhdProfile.accommodations.join(', ')}` : ''}
- Existing rituals: ${existingRituals.map(r => `${r.name} (${r.type}, ${r.duration}m)`).join(', ') || 'None'}

Recent Performance:
- Most productive hours: ${bestHours.map(h => `${h}:00`).join(', ')}
- Average HRV: ${avgHrv ? Math.round(avgHrv) : 'N/A'} ms
- Average sleep quality: ${avgSleepQuality ? Math.round(avgSleepQuality) : 'N/A'}%

User Request:
${input.goal ? `- Goal: ${input.goal}` : '- No specific goal provided'}
${input.timeAvailable ? `- Time available: ${input.timeAvailable} minutes` : '- No time constraint specified'}

Available Soundscape Categories: ${[...new Set(soundscapes.map(s => s.category))].join(', ')}
    `.trim();

    // Generate ritual suggestions using AI
    const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
    const model = openrouter("openai/gpt-4o");

    const { object } = await generateObject({
      model,
      schema: ritualSuggestionSchema,
      prompt: `You are an AI wellness coach specializing in ADHD-friendly productivity rituals. Based on the user's data, generate 3-5 personalized ritual suggestions.

${context}

Generate rituals that:
1. Match the user's typical session length and patterns
2. Consider their ADHD profile (if present) - shorter, more varied sessions for ADHD users
3. Align with their most productive times
4. Fill gaps in their existing ritual library
5. Are specific and actionable with clear purposes
6. Include health-adaptive recommendations if their health data shows variability

For each ritual, provide:
- A descriptive, motivating name
- The appropriate type (focus/break/reflection/custom)
- Duration in minutes (consider their average session length)
- Clear reasoning for why this ritual suits them
- Best time of day to practice it
- Suggested soundscape category
- Whether it should be health-adaptive (true if their health metrics vary significantly)

Make suggestions practical, achievable, and aligned with their demonstrated patterns.`,
    });

    return {
      suggestions: object.rituals,
      userContext: {
        avgDuration: Math.round(avgDuration),
        bestHours,
        hasADHDProfile: !!user?.adhdProfile,
      },
    };
  });
