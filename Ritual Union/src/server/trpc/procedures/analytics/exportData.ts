import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const exportData = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      format: z.enum(["json", "csv"]),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
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

    // Parse date filters
    const startDate = input.startDate ? new Date(input.startDate) : undefined;
    const endDate = input.endDate ? new Date(input.endDate) : undefined;

    // Fetch all user data
    const [sessions, healthSnapshots, insights, achievements, user] = await Promise.all([
      db.focusSession.findMany({
        where: {
          userId,
          ...(startDate && { startedAt: { gte: startDate } }),
          ...(endDate && { startedAt: { lte: endDate } }),
        },
        include: {
          ritual: true,
        },
        orderBy: {
          startedAt: "asc",
        },
      }),
      db.healthSnapshot.findMany({
        where: {
          userId,
          ...(startDate && { timestamp: { gte: startDate } }),
          ...(endDate && { timestamp: { lte: endDate } }),
        },
        orderBy: {
          timestamp: "asc",
        },
      }),
      db.insight.findMany({
        where: {
          userId,
          ...(startDate && { generatedAt: { gte: startDate } }),
          ...(endDate && { generatedAt: { lte: endDate } }),
        },
        orderBy: {
          generatedAt: "asc",
        },
      }),
      db.userAchievement.findMany({
        where: {
          userId,
          ...(startDate && { unlockedAt: { gte: startDate } }),
          ...(endDate && { unlockedAt: { lte: endDate } }),
        },
        include: {
          achievement: true,
        },
        orderBy: {
          unlockedAt: "asc",
        },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          timezone: true,
        },
      }),
    ]);

    // Calculate summary statistics
    const completedSessions = sessions.filter(s => s.completed);
    const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const avgDuration = completedSessions.length > 0 ? totalMinutes / completedSessions.length : 0;
    const completionRate = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0;

    const avgHrv = healthSnapshots.filter(s => s.hrv).length > 0
      ? healthSnapshots.reduce((sum, s) => sum + (s.hrv || 0), 0) / healthSnapshots.filter(s => s.hrv).length
      : null;

    const avgSleepQuality = healthSnapshots.filter(s => s.sleepQuality).length > 0
      ? healthSnapshots.reduce((sum, s) => sum + (s.sleepQuality || 0), 0) / healthSnapshots.filter(s => s.sleepQuality).length
      : null;

    // Format data based on requested format
    if (input.format === "json") {
      return {
        format: "json",
        data: {
          user: user,
          exportDate: new Date().toISOString(),
          dateRange: {
            start: startDate?.toISOString(),
            end: endDate?.toISOString(),
          },
          summary: {
            totalSessions: sessions.length,
            completedSessions: completedSessions.length,
            completionRate: Math.round(completionRate),
            totalMinutes,
            avgDuration: Math.round(avgDuration),
            avgHrv: avgHrv ? Math.round(avgHrv) : null,
            avgSleepQuality: avgSleepQuality ? Math.round(avgSleepQuality) : null,
            totalAchievements: achievements.length,
          },
          sessions: sessions.map(s => ({
            id: s.id,
            ritualName: s.ritual.name,
            ritualType: s.ritual.type,
            startedAt: s.startedAt.toISOString(),
            endedAt: s.endedAt?.toISOString(),
            plannedDuration: s.plannedDuration,
            actualDuration: s.actualDuration,
            completed: s.completed,
            hrvStart: s.hrvStart,
            hrvEnd: s.hrvEnd,
            avgHeartRate: s.avgHeartRate,
            sleepQualityPrior: s.sleepQualityPrior,
            userRating: s.userRating,
          })),
          healthSnapshots: healthSnapshots.map(h => ({
            timestamp: h.timestamp.toISOString(),
            source: h.source,
            hrv: h.hrv,
            sleepDuration: h.sleepDuration,
            sleepQuality: h.sleepQuality,
            activeEnergy: h.activeEnergy,
            mindfulMinutes: h.mindfulMinutes,
            steps: h.steps,
          })),
          insights: insights.map(i => ({
            type: i.type,
            title: i.title,
            description: i.description,
            generatedAt: i.generatedAt.toISOString(),
          })),
          achievements: achievements.map(a => ({
            name: a.achievement.name,
            description: a.achievement.description,
            category: a.achievement.category,
            unlockedAt: a.unlockedAt.toISOString(),
          })),
        },
      };
    } else {
      // CSV format - create a simple sessions CSV
      const csvRows = [
        ["Date", "Time", "Ritual", "Type", "Duration (min)", "Completed", "HRV Start", "HRV End", "Heart Rate", "Rating"].join(","),
        ...sessions.map(s => [
          s.startedAt.toISOString().split('T')[0],
          s.startedAt.toISOString().split('T')[1].split('.')[0],
          `"${s.ritual.name}"`,
          s.ritual.type,
          s.actualDuration || 0,
          s.completed ? "Yes" : "No",
          s.hrvStart || "",
          s.hrvEnd || "",
          s.avgHeartRate || "",
          s.userRating || "",
        ].join(",")),
      ];

      return {
        format: "csv",
        data: csvRows.join("\n"),
        summary: {
          totalSessions: sessions.length,
          completedSessions: completedSessions.length,
          totalMinutes,
        },
      };
    }
  });
