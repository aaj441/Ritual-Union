import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { AuthGuard } from "~/components/AuthGuard";
import { RitualCard } from "~/components/RitualCard";
import { Plus, ArrowLeft, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/rituals/")({
  component: RitualsPage,
});

function RitualsPage() {
  return (
    <AuthGuard>
      <RitualsContent />
    </AuthGuard>
  );
}

function RitualsContent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

  const ritualsQuery = useQuery(
    trpc.getRituals.queryOptions({ authToken: authToken! })
  );

  const startSessionMutation = useMutation(
    trpc.startSession.mutationOptions({
      onSuccess: (data) => {
        toast.success("Ritual started!");
        navigate({ to: "/timer", search: { sessionId: data.id } });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to start ritual");
      },
    })
  );

  const handleStartRitual = (ritualId: number, duration: number) => {
    startSessionMutation.mutate({
      authToken: authToken!,
      ritualId,
      plannedDuration: duration,
      hrvStart: 65, // Mock data
      sleepQualityPrior: 82, // Mock data
    });
  };

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
                Your Rituals
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: "/rituals/ai-suggest" })}
                className="flex items-center gap-2 rounded-xl border-2 border-ritual-gold px-6 py-3 font-semibold text-ritual-gold transition-all duration-300 hover:bg-ritual-gold/10"
              >
                <Sparkles className="h-5 w-5" />
                AI Suggest
              </button>
              <button
                onClick={() => navigate({ to: "/rituals/create" })}
                className="flex items-center gap-2 rounded-xl bg-ritual-gold px-6 py-3 font-semibold text-ritual-charcoal transition-all duration-300 hover:scale-105 hover:bg-ritual-gold-light"
              >
                <Plus className="h-5 w-5" />
                Create Ritual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {ritualsQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-ritual-indigo border-t-ritual-gold"></div>
          </div>
        ) : ritualsQuery.data && ritualsQuery.data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ritualsQuery.data.map((ritual) => (
              <RitualCard
                key={ritual.id}
                name={ritual.name}
                type={ritual.type}
                duration={ritual.duration}
                soundscapeName={ritual.soundscape?.name}
                onStart={() => handleStartRitual(ritual.id, ritual.duration)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="mb-6 text-6xl">🧘‍♂️</div>
            <h2 className="mb-4 font-rounded text-2xl font-semibold text-white">
              No rituals yet
            </h2>
            <p className="mb-8 text-gray-400">
              Create your first ritual to begin your journey to sustainable productivity
            </p>
            <button
              onClick={() => navigate({ to: "/rituals/create" })}
              className="rounded-xl bg-ritual-gold px-8 py-4 font-semibold text-ritual-charcoal transition-all duration-300 hover:scale-105 hover:bg-ritual-gold-light"
            >
              Create Your First Ritual
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
