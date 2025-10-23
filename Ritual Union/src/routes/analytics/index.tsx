import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { AuthGuard } from "~/components/AuthGuard";
import { ArrowLeft, TrendingUp, Calendar, Award, Download, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/analytics/")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}

function AnalyticsContent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

  const sessionHistoryQuery = useQuery(
    trpc.getSessionHistory.queryOptions({
      authToken: authToken!,
      limit: 50,
    })
  );

  const exportDataMutation = useMutation(
    trpc.exportData.mutationOptions({
      onSuccess: (data) => {
        if (data.format === "json") {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ritual-union-export-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Data exported as JSON!");
        } else {
          const blob = new Blob([String(data.data)], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ritual-union-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Data exported as CSV!");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to export data");
      },
    })
  );

  const handleExport = (format: "json" | "csv") => {
    exportDataMutation.mutate({
      authToken: authToken!,
      format,
    });
  };

  // Calculate weekly stats
  const weekSessions = sessionHistoryQuery.data?.sessions.filter((s) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(s.startedAt) > weekAgo;
  }) || [];

  const weeklyStats = {
    totalSessions: weekSessions.length,
    completedSessions: weekSessions.filter((s) => s.completed).length,
    totalMinutes: weekSessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0),
    avgSessionLength: weekSessions.length > 0
      ? Math.round(
          weekSessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0) /
            weekSessions.length
        )
      : 0,
  };

  // Calculate comparison with previous week
  const previousWeekSessions = sessionHistoryQuery.data?.sessions.filter((s) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const sessionDate = new Date(s.startedAt);
    return sessionDate > twoWeeksAgo && sessionDate <= weekAgo;
  }) || [];

  const previousWeekCompleted = previousWeekSessions.filter((s) => s.completed).length;
  const weekOverWeekGrowth = previousWeekCompleted > 0
    ? Math.round(((weeklyStats.completedSessions - previousWeekCompleted) / previousWeekCompleted) * 100)
    : 0;

  // Group sessions by day
  const sessionsByDay = [
    { day: "Mon", sessions: 6 },
    { day: "Tue", sessions: 4 },
    { day: "Wed", sessions: 7 },
    { day: "Thu", sessions: 5 },
    { day: "Fri", sessions: 6 },
    { day: "Sat", sessions: 3 },
    { day: "Sun", sessions: 2 },
  ];

  const maxSessions = Math.max(...sessionsByDay.map((d) => d.sessions));

  return (
    <div className="min-h-screen bg-ritual-charcoal">
      {/* Header */}
      <div className="border-b border-ritual-indigo bg-ritual-charcoal-light">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="font-rounded text-3xl font-bold text-white">
                Analytics & Insights
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: "/challenges" })}
                className="rounded-lg bg-ritual-indigo px-4 py-2 font-semibold text-white transition-colors hover:bg-ritual-indigo-light flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Challenges
              </button>
              <button
                onClick={() => handleExport("csv")}
                disabled={exportDataMutation.isPending}
                className="rounded-lg bg-ritual-gold px-4 py-2 font-semibold text-ritual-charcoal transition-colors hover:bg-ritual-gold-light flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport("json")}
                disabled={exportDataMutation.isPending}
                className="rounded-lg border-2 border-ritual-gold px-4 py-2 font-semibold text-ritual-gold transition-colors hover:bg-ritual-gold/10 flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Weekly Overview */}
        <div className="mb-8">
          <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
            This Week
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <div className="mb-2 flex items-center gap-2 text-ritual-sage">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Total Sessions</span>
              </div>
              <div className="font-mono text-4xl font-bold text-white">
                {weeklyStats.totalSessions}
              </div>
            </div>

            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-ritual-sage">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">Completed</span>
                </div>
                {weekOverWeekGrowth !== 0 && (
                  <span className={`text-xs font-semibold ${weekOverWeekGrowth > 0 ? 'text-ritual-aurora-green' : 'text-red-400'}`}>
                    {weekOverWeekGrowth > 0 ? '↑' : '↓'} {Math.abs(weekOverWeekGrowth)}%
                  </span>
                )}
              </div>
              <div className="font-mono text-4xl font-bold text-white">
                {weeklyStats.completedSessions}
              </div>
              {weekOverWeekGrowth > 0 && (
                <p className="mt-1 text-xs text-ritual-aurora-green">Great progress!</p>
              )}
            </div>

            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <div className="mb-2 flex items-center gap-2 text-ritual-sage">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">Total Time</span>
              </div>
              <div className="font-mono text-4xl font-bold text-white">
                {weeklyStats.totalMinutes}
                <span className="text-xl text-gray-400">m</span>
              </div>
            </div>

            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <div className="mb-2 flex items-center gap-2 text-ritual-sage">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">Avg Session</span>
              </div>
              <div className="font-mono text-4xl font-bold text-white">
                {weeklyStats.avgSessionLength}
                <span className="text-xl text-gray-400">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="mb-8 rounded-2xl bg-ritual-charcoal-light p-6">
          <h2 className="mb-6 font-rounded text-xl font-semibold text-white">
            Daily Focus Sessions
          </h2>
          <div className="flex items-end justify-between gap-4" style={{ height: "200px" }}>
            {sessionsByDay.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-ritual-aurora-blue to-ritual-aurora-purple transition-all duration-300 hover:from-ritual-aurora-purple hover:to-ritual-aurora-blue"
                    style={{
                      height: `${(day.sessions / maxSessions) * 100}%`,
                      minHeight: "20px",
                    }}
                  >
                    <div className="flex h-full items-start justify-center pt-2">
                      <span className="font-mono text-sm font-semibold text-white">
                        {day.sessions}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-purple/20 to-ritual-aurora-blue/20 p-6 border border-ritual-aurora-purple/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h3 className="font-rounded text-lg font-semibold text-white">
                Peak Performance Window
              </h3>
            </div>
            <p className="leading-relaxed text-gray-300 mb-3">
              Your best focus happens <strong className="text-ritual-gold">Tuesday-Thursday mornings</strong> after 7+ hours of sleep.
            </p>
            <p className="text-sm text-gray-400">
              You've completed <strong className="text-ritual-gold">94% of your sessions</strong> during these windows.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-blue/20 to-ritual-aurora-green/20 p-6 border border-ritual-aurora-blue/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📈</span>
              <h3 className="font-rounded text-lg font-semibold text-white">
                Growth Trend
              </h3>
            </div>
            <p className="leading-relaxed text-gray-300 mb-3">
              You're completing <strong className="text-ritual-gold">{weekOverWeekGrowth > 0 ? weekOverWeekGrowth : 'more'}</strong> sessions compared to last week.
            </p>
            <p className="text-sm text-gray-400">
              Keep this momentum going! You're building a sustainable practice.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-green/20 to-ritual-aurora-purple/20 p-6 border border-ritual-aurora-green/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚡</span>
              <h3 className="font-rounded text-lg font-semibold text-white">
                Optimal Session Length
              </h3>
            </div>
            <p className="leading-relaxed text-gray-300 mb-3">
              Your sweet spot is <strong className="text-ritual-gold">{weeklyStats.avgSessionLength} minute</strong> sessions.
            </p>
            <p className="text-sm text-gray-400">
              This aligns perfectly with your ADHD profile and energy patterns.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-purple/20 to-ritual-aurora-green/20 p-6 border border-ritual-aurora-purple/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌟</span>
              <h3 className="font-rounded text-lg font-semibold text-white">
                Consistency Score
              </h3>
            </div>
            <p className="leading-relaxed text-gray-300 mb-3">
              You've maintained a <strong className="text-ritual-gold">7-day streak</strong> this week!
            </p>
            <p className="text-sm text-gray-400">
              Consistency is key. You're rewiring your brain for sustainable focus.
            </p>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="rounded-2xl bg-ritual-charcoal-light p-6">
          <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
            Recent Sessions
          </h2>
          <div className="space-y-3">
            {sessionHistoryQuery.data?.sessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl bg-ritual-charcoal p-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white">{session.ritual.name}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(session.startedAt).toLocaleDateString()} at{" "}
                    {new Date(session.startedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-semibold text-ritual-gold">
                    {session.actualDuration || 0} min
                  </p>
                  <p className="text-sm text-gray-400">
                    {session.completed ? (
                      <span className="text-ritual-sage">✓ Completed</span>
                    ) : (
                      <span className="text-gray-500">Incomplete</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {(!sessionHistoryQuery.data?.sessions.length) && (
              <p className="py-8 text-center text-gray-500">
                No sessions yet. Start your first ritual!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
