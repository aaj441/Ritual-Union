import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { AuthGuard } from "~/components/AuthGuard";
import { ArrowLeft, Trophy, Target, Zap, Crown, Star } from "lucide-react";

export const Route = createFileRoute("/challenges/")({
  component: ChallengesPage,
});

function ChallengesPage() {
  return (
    <AuthGuard>
      <ChallengesContent />
    </AuthGuard>
  );
}

function ChallengesContent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

  const challengesQuery = useQuery(
    trpc.getChallenges.queryOptions({
      authToken: authToken!,
    })
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-ritual-aurora-green border-ritual-aurora-green";
      case "medium":
        return "text-ritual-gold border-ritual-gold";
      case "hard":
        return "text-ritual-aurora-purple border-ritual-aurora-purple";
      case "epic":
        return "text-ritual-aurora-blue border-ritual-aurora-blue";
      default:
        return "text-gray-400 border-gray-400";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Target className="h-4 w-4" />;
      case "medium":
        return <Zap className="h-4 w-4" />;
      case "hard":
        return <Star className="h-4 w-4" />;
      case "epic":
        return <Crown className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-ritual-charcoal">
      {/* Header */}
      <div className="border-b border-ritual-indigo bg-ritual-charcoal-light">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/analytics" })}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="font-rounded text-3xl font-bold text-white flex items-center gap-2">
                <Trophy className="h-8 w-8 text-ritual-gold" />
                Challenge Arena
              </h1>
              <p className="text-gray-400 mt-1">Push your limits and earn rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* User Stats */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-ritual-aurora-purple/20 to-ritual-aurora-blue/20 p-6 border border-ritual-aurora-purple/30">
          <h2 className="font-rounded text-xl font-semibold text-white mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-1">🔥</div>
              <div className="font-mono text-2xl font-bold text-ritual-gold">
                {challengesQuery.data?.userStats.currentStreak || 0}
              </div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">⚡</div>
              <div className="font-mono text-2xl font-bold text-ritual-gold">
                {challengesQuery.data?.userStats.weeklySessions || 0}
              </div>
              <div className="text-sm text-gray-400">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🎯</div>
              <div className="font-mono text-2xl font-bold text-ritual-gold">
                {challengesQuery.data?.userStats.totalSessions || 0}
              </div>
              <div className="text-sm text-gray-400">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🏆</div>
              <div className="font-mono text-2xl font-bold text-ritual-gold">
                {challengesQuery.data?.userStats.totalAchievements || 0}
              </div>
              <div className="text-sm text-gray-400">Achievements</div>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
          Active Challenges
        </h2>

        {challengesQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-ritual-indigo border-t-ritual-gold"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {challengesQuery.data?.challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`rounded-2xl bg-ritual-charcoal-light p-6 border-2 transition-all ${
                  challenge.completed
                    ? "border-ritual-aurora-green"
                    : "border-ritual-indigo hover:border-ritual-gold"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{challenge.icon}</div>
                    <div>
                      <h3 className="font-rounded text-lg font-semibold text-white">
                        {challenge.name}
                      </h3>
                      <p className="text-sm text-gray-400">{challenge.description}</p>
                    </div>
                  </div>
                  <div className={`rounded-lg border px-3 py-1 text-xs font-semibold uppercase ${getDifficultyColor(challenge.difficulty)} flex items-center gap-1`}>
                    {getDifficultyIcon(challenge.difficulty)}
                    {challenge.difficulty}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-semibold text-ritual-gold">
                      {challenge.current} / {challenge.target}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-ritual-charcoal overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        challenge.completed
                          ? "bg-gradient-to-r from-ritual-aurora-green to-ritual-aurora-blue"
                          : "bg-gradient-to-r from-ritual-gold to-ritual-gold-light"
                      }`}
                      style={{ width: `${Math.min(challenge.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Reward */}
                <div className="rounded-lg bg-ritual-charcoal p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Reward:</span>
                    <span className="text-sm font-semibold text-ritual-gold">
                      {challenge.reward}
                    </span>
                  </div>
                </div>

                {/* Completed Badge */}
                {challenge.completed && (
                  <div className="mt-4 rounded-lg bg-gradient-to-r from-ritual-aurora-green/20 to-ritual-aurora-blue/20 p-3 border border-ritual-aurora-green/30">
                    <div className="flex items-center gap-2 text-ritual-aurora-green">
                      <Trophy className="h-5 w-5" />
                      <span className="font-semibold">Challenge Completed!</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-12 rounded-2xl bg-ritual-charcoal-light p-8 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="font-rounded text-2xl font-bold text-white mb-2">
            Team Challenges Coming Soon
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Compete with friends, join teams, and participate in community-wide events. 
            Stay tuned for multiplayer challenges and leaderboards!
          </p>
        </div>
      </div>
    </div>
  );
}
