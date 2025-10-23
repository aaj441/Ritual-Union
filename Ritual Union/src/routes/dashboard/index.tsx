import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { AuthGuard } from "~/components/AuthGuard";
import { ProgressRing } from "~/components/ProgressRing";
import {
  Play,
  Clock,
  TrendingUp,
  Calendar,
  Heart,
  Menu,
  LogOut,
  User,
  Library,
  BarChart3,
  Users,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [showMenu, setShowMenu] = useState(false);

  const profileQuery = useQuery(
    trpc.getProfile.queryOptions({ authToken: authToken! })
  );

  const ritualsQuery = useQuery(
    trpc.getRituals.queryOptions({ authToken: authToken! })
  );

  const sessionHistoryQuery = useQuery(
    trpc.getSessionHistory.queryOptions({
      authToken: authToken!,
      limit: 10,
    })
  );

  // Mock health data (would come from HealthKit/Health Connect in production)
  const mockHealthData = {
    hrv: 65,
    hrvStatus: "High",
    sleepHours: 7.5,
    sleepQuality: 82,
  };

  // Calculate today's progress
  const todaySessions = sessionHistoryQuery.data?.sessions.filter((s) => {
    const today = new Date().toDateString();
    return new Date(s.startedAt).toDateString() === today;
  }) || [];

  const completedToday = todaySessions.filter((s) => s.completed).length;
  const targetSessions = 4;
  const progressPercentage = (completedToday / targetSessions) * 100;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleLogout = () => {
    clearAuth();
    navigate({ to: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-ritual-charcoal">
      {/* Navigation */}
      <nav className="border-b border-ritual-indigo bg-ritual-charcoal-light">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-rounded text-2xl font-bold text-ritual-gold">
              Ritual Engine
            </h1>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="rounded-lg px-4 py-2 text-ritual-gold transition-colors hover:bg-ritual-indigo/20"
              >
                <Calendar className="inline h-5 w-5" />
              </Link>
              <Link
                to="/rituals"
                className="rounded-lg px-4 py-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
              >
                <Library className="inline h-5 w-5" />
              </Link>
              <Link
                to="/analytics"
                className="rounded-lg px-4 py-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
              >
                <BarChart3 className="inline h-5 w-5" />
              </Link>
              <Link
                to="/body-doubling"
                className="rounded-lg px-4 py-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
              >
                <Users className="inline h-5 w-5" />
              </Link>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg px-4 py-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-4 top-16 z-50 w-48 rounded-xl border border-ritual-indigo bg-ritual-charcoal-light shadow-2xl">
            <div className="p-2">
              <button
                onClick={() => navigate({ to: "/profile" })}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-gray-300 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-left text-gray-300 transition-colors hover:bg-ritual-indigo/20 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header with Streak */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-rounded text-3xl font-bold text-white">
                {getGreeting()}, {user?.name}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-ritual-sage">
                <Heart className="h-5 w-5" />
                Your body is ready for{" "}
                <span className="font-semibold text-ritual-gold">
                  {mockHealthData.hrvStatus === "High" ? "Deep Work" : "Gentle Focus"}
                </span>{" "}
                today (HRV: {mockHealthData.hrvStatus})
              </p>
            </div>
            
            {/* Streak Badge */}
            <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-purple/20 to-ritual-aurora-blue/20 p-4 text-center">
              <div className="text-3xl mb-1">🔥</div>
              <div className="font-mono text-2xl font-bold text-ritual-gold">7</div>
              <div className="text-xs text-gray-400">day streak</div>
            </div>
          </div>
          
          {/* Achievement Banner */}
          {completedToday >= targetSessions && (
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-ritual-aurora-green/20 to-ritual-aurora-blue/20 p-4 border border-ritual-aurora-green/30 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎉</div>
                <div>
                  <p className="font-semibold text-white">Daily Goal Achieved!</p>
                  <p className="text-sm text-gray-400">You've completed all {targetSessions} focus sessions today. Amazing work!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Current Ritual & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Ritual Card */}
            <div className="rounded-3xl bg-gradient-to-br from-ritual-indigo to-ritual-indigo-dark p-8 shadow-2xl">
              <h3 className="mb-6 font-rounded text-xl font-semibold text-white">
                Ready to Begin?
              </h3>
              
              <div className="flex items-center justify-center">
                <ProgressRing progress={progressPercentage} size={200} strokeWidth={12}>
                  <div className="text-center">
                    <div className="font-mono text-4xl font-bold text-ritual-gold">
                      {completedToday}/{targetSessions}
                    </div>
                    <div className="text-sm text-gray-400">sessions</div>
                  </div>
                </ProgressRing>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  You've completed {completedToday} focus session{completedToday !== 1 ? 's' : ''} today
                </p>
              </div>

              <button
                onClick={() => navigate({ to: "/rituals" })}
                className="mt-6 w-full rounded-xl bg-ritual-gold py-4 font-semibold text-ritual-charcoal transition-all duration-300 hover:scale-105 hover:bg-ritual-gold-light"
              >
                <Play className="mr-2 inline h-5 w-5" fill="currentColor" />
                Start Next Ritual
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-ritual-charcoal-light p-6">
                <div className="mb-2 flex items-center gap-2 text-ritual-sage">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">Total Focus Time</span>
                </div>
                <div className="font-mono text-3xl font-bold text-white">
                  {todaySessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0)} min
                </div>
                <p className="mt-1 text-xs text-gray-500">today</p>
              </div>

              <div className="rounded-2xl bg-ritual-charcoal-light p-6">
                <div className="mb-2 flex items-center gap-2 text-ritual-sage">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Completion Rate</span>
                </div>
                <div className="font-mono text-3xl font-bold text-white">
                  {todaySessions.length > 0
                    ? Math.round((completedToday / todaySessions.length) * 100)
                    : 0}%
                </div>
                <p className="mt-1 text-xs text-gray-500">this week</p>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h3 className="mb-4 font-rounded text-lg font-semibold text-white">
                Recent Sessions
              </h3>
              <div className="space-y-3">
                {sessionHistoryQuery.data?.sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl bg-ritual-charcoal p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {session.ritual.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(session.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold text-ritual-gold">
                        {session.actualDuration || 0} min
                      </p>
                      <p className="text-sm text-gray-400">
                        {session.completed ? "✓ Completed" : "Incomplete"}
                      </p>
                    </div>
                  </div>
                ))}
                {(!sessionHistoryQuery.data?.sessions.length) && (
                  <p className="text-center text-gray-500 py-8">
                    No sessions yet. Start your first ritual!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Health & Insights */}
          <div className="space-y-6">
            {/* Health Data */}
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h3 className="mb-4 font-rounded text-lg font-semibold text-white">
                Today's Health
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-400">HRV</span>
                    <span className="font-semibold text-ritual-gold">
                      {mockHealthData.hrv} ms
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ritual-charcoal">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-ritual-aurora-green to-ritual-aurora-blue"
                      style={{ width: `${(mockHealthData.hrv / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Sleep Duration</span>
                    <span className="font-semibold text-ritual-gold">
                      {mockHealthData.sleepHours}h
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ritual-charcoal">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-ritual-aurora-purple to-ritual-aurora-blue"
                      style={{ width: `${(mockHealthData.sleepHours / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Sleep Quality</span>
                    <span className="font-semibold text-ritual-gold">
                      {mockHealthData.sleepQuality}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ritual-charcoal">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-ritual-sage to-ritual-sage-light"
                      style={{ width: `${mockHealthData.sleepQuality}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-purple/20 to-ritual-aurora-blue/20 p-6 border border-ritual-aurora-purple/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">💡</div>
                <h3 className="font-rounded text-lg font-semibold text-white">
                  AI Insight
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-ritual-gold mb-2">
                    🎯 Optimal Focus Window
                  </p>
                  <p className="text-sm leading-relaxed text-gray-300">
                    Your best focus happens Tuesday-Thursday mornings after 7+ hours of sleep. 
                    Consider scheduling your most important work during these windows.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ritual-gold mb-2">
                    💪 Energy Pattern
                  </p>
                  <p className="text-sm leading-relaxed text-gray-300">
                    You complete 94% of sessions when your HRV is "High". Today's reading suggests this is a great day for challenging work.
                  </p>
                </div>
                <button 
                  onClick={() => navigate({ to: "/analytics" })}
                  className="mt-4 text-sm font-semibold text-ritual-gold hover:text-ritual-gold-light flex items-center gap-1"
                >
                  View All Insights 
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Milestones */}
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h3 className="mb-4 font-rounded text-lg font-semibold text-white">
                🏆 Recent Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-ritual-charcoal">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">First Week Complete</p>
                    <p className="text-xs text-gray-400">7 days of consistent practice</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-ritual-charcoal">
                  <div className="text-2xl">⚡</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Focus Master</p>
                    <p className="text-xs text-gray-400">Completed 10 deep work sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-ritual-charcoal">
                  <div className="text-2xl">🌟</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">Early Bird</p>
                    <p className="text-xs text-gray-400">5 morning rituals this week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h3 className="mb-4 font-rounded text-lg font-semibold text-white">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate({ to: "/rituals/create" })}
                  className="w-full rounded-xl bg-ritual-indigo px-4 py-3 text-left text-white transition-colors hover:bg-ritual-indigo-light"
                >
                  + Create New Ritual
                </button>
                <button
                  onClick={() => navigate({ to: "/rituals/ai-suggest" })}
                  className="w-full rounded-xl bg-gradient-to-r from-ritual-aurora-purple/20 to-ritual-aurora-blue/20 border border-ritual-aurora-purple/30 px-4 py-3 text-left text-white transition-colors hover:from-ritual-aurora-purple/30 hover:to-ritual-aurora-blue/30 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-ritual-gold" />
                  AI Ritual Designer
                </button>
                <button
                  onClick={() => navigate({ to: "/body-doubling" })}
                  className="w-full rounded-xl bg-ritual-indigo px-4 py-3 text-left text-white transition-colors hover:bg-ritual-indigo-light flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Join Body Doubling
                </button>
                <button
                  onClick={() => navigate({ to: "/challenges" })}
                  className="w-full rounded-xl bg-ritual-indigo px-4 py-3 text-left text-white transition-colors hover:bg-ritual-indigo-light flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  View Challenges
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
