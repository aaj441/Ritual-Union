import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getChallenges = baseProcedure
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

    // Get user's session count for this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [weeklySessions, totalSessions, userAchievements] = await Promise.all([
      db.focusSession.count({
        where: {
          userId,
          completed: true,
          startedAt: {
            gte: weekAgo,
          },
        },
      }),
      db.focusSession.count({
        where: {
          userId,
          completed: true,
        },
      }),
      db.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      }),
    ]);

    // Calculate streak
    const sessions = await db.focusSession.findMany({
      where: { userId, completed: true },
      orderBy: { startedAt: "desc" },
      take: 30,
    });

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasSession = sessions.some(s => {
        const sessionDate = new Date(s.startedAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });
      if (hasSession) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Define challenges
    const challenges = [
      {
        id: "weekly-warrior",
        name: "Weekly Warrior",
        description: "Complete 10 focus sessions this week",
        type: "weekly",
        target: 10,
        current: weeklySessions,
        reward: "100 XP + Special Badge",
        icon: "⚔️",
        difficulty: "medium",
      },
      {
        id: "consistency-king",
        name: "Consistency King",
        description: "Maintain a 14-day streak",
        type: "streak",
        target: 14,
        current: currentStreak,
        reward: "200 XP + Streak Master Badge",
        icon: "👑",
        difficulty: "hard",
      },
      {
        id: "early-bird-challenge",
        name: "Early Bird Challenge",
        description: "Complete 5 sessions before 9 AM this week",
        type: "weekly",
        target: 5,
        current: 0, // Would need to calculate
        reward: "50 XP + Morning Person Badge",
        icon: "🌅",
        difficulty: "easy",
      },
      {
        id: "deep-work-master",
        name: "Deep Work Master",
        description: "Complete 3 sessions of 50+ minutes",
        type: "milestone",
        target: 3,
        current: 0, // Would need to calculate
        reward: "150 XP + Focus Champion Badge",
        icon: "🎯",
        difficulty: "hard",
      },
      {
        id: "century-club",
        name: "Century Club",
        description: "Complete 100 total sessions",
        type: "lifetime",
        target: 100,
        current: totalSessions,
        reward: "500 XP + Century Badge",
        icon: "💯",
        difficulty: "epic",
      },
    ];

    return {
      challenges: challenges.map(c => ({
        ...c,
        progress: Math.min((c.current / c.target) * 100, 100),
        completed: c.current >= c.target,
      })),
      userStats: {
        weeklySessions,
        totalSessions,
        currentStreak,
        totalAchievements: userAchievements.length,
      },
    };
  });
