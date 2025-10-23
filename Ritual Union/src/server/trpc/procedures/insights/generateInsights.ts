import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

const insightSchema = z.object({
  insights: z.array(
    z.object({
      type: z.enum(["pattern", "recommendation", "celebration"]),
      title: z.string(),
      description: z.string(),
    })
  ),
});

export const generateInsights = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
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

    // Fetch recent data for analysis
    const [healthSnapshots, sessions, user] = await Promise.all([
      db.healthSnapshot.findMany({
        where: { userId },
        orderBy: { timestamp: "desc" },
        take: 30,
      }),
      db.focusSession.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 50,
        include: { ritual: true },
      }),
      db.user.findUnique({
        where: { id: userId },
        include: { adhdProfile: true },
      }),
    ]);

    if (sessions.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Not enough data to generate insights. Complete more sessions first.",
      });
    }

    // Prepare data summary for AI
    const completedSessions = sessions.filter((s) => s.completed);
    const avgDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / completedSessions.length
      : 0;
    
    const sessionsByDayOfWeek = sessions.reduce((acc, s) => {
      const day = new Date(s.startedAt).getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const sessionsByHour = sessions.reduce((acc, s) => {
      const hour = new Date(s.startedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const bestDayOfWeek = Object.entries(sessionsByDayOfWeek).sort((a, b) => b[1] - a[1])[0];
    const bestHour = Object.entries(sessionsByHour).sort((a, b) => b[1] - a[1])[0];

    const avgHrv = healthSnapshots.filter(s => s.hrv).length > 0
      ? healthSnapshots.reduce((sum, s) => sum + (s.hrv || 0), 0) / healthSnapshots.filter(s => s.hrv).length
      : null;
    
    const avgSleepQuality = healthSnapshots.filter(s => s.sleepQuality).length > 0
      ? healthSnapshots.reduce((sum, s) => sum + (s.sleepQuality || 0), 0) / healthSnapshots.filter(s => s.sleepQuality).length
      : null;

    // Calculate streak
    let currentStreak = 0;
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasSession = sortedSessions.some(s => {
        const sessionDate = new Date(s.startedAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime() && s.completed;
      });
      if (hasSession) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    const dataSummary = `
User Profile:
- Total sessions: ${sessions.length}
- Completed sessions: ${completedSessions.length}
- Completion rate: ${sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0}%
- Average session duration: ${Math.round(avgDuration)} minutes
- Current streak: ${currentStreak} days
- ADHD profile: ${user?.adhdProfile ? 'Yes' : 'No'}
${user?.adhdProfile ? `- Primary challenges: ${user.adhdProfile.primaryChallenges.join(', ')}` : ''}

Session Patterns:
- Most productive day: ${bestDayOfWeek ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(bestDayOfWeek[0])] : 'N/A'}
- Most productive hour: ${bestHour ? `${bestHour[0]}:00` : 'N/A'}

Health Metrics (last 30 days):
- Average HRV: ${avgHrv ? Math.round(avgHrv) : 'N/A'} ms
- Average sleep quality: ${avgSleepQuality ? Math.round(avgSleepQuality) : 'N/A'}%
- Health snapshots recorded: ${healthSnapshots.length}

Recent Session Details:
${sessions.slice(0, 10).map(s => `- ${s.ritual.name} (${s.ritual.type}): ${s.completed ? 'Completed' : 'Incomplete'}, ${s.actualDuration || 0} min, HRV: ${s.hrvStart || 'N/A'}`).join('\n')}
    `.trim();

    // Generate insights using AI
    const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
    const model = openrouter("openai/gpt-4o");

    const { object } = await generateObject({
      model,
      schema: insightSchema,
      prompt: `You are an AI wellness coach analyzing a user's focus ritual practice and health data. Based on the following data, generate 3-5 personalized insights that include:
1. At least one "pattern" insight identifying trends in their data
2. At least one "recommendation" for optimal ritual timing or practice improvements
3. Optionally, a "celebration" insight if they've achieved something noteworthy

Be specific, actionable, and encouraging. Reference actual data points.

${dataSummary}

Generate insights that are:
- Specific to their data (use actual numbers and patterns)
- Actionable (give clear next steps)
- Encouraging (positive tone)
- Brief (2-3 sentences max per insight)`,
    });

    // Store insights in database
    const createdInsights = await Promise.all(
      object.insights.map((insight) =>
        db.insight.create({
          data: {
            userId,
            type: insight.type,
            title: insight.title,
            description: insight.description,
          },
        })
      )
    );

    return {
      insights: createdInsights,
    };
  });
