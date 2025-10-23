import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { AuthGuard } from "~/components/AuthGuard";
import { ArrowLeft, Sparkles, Clock, Target, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/rituals/ai-suggest/")({
  component: AISuggestPage,
});

function AISuggestPage() {
  return (
    <AuthGuard>
      <AISuggestContent />
    </AuthGuard>
  );
}

interface SuggestFormData {
  goal: string;
  timeAvailable: number;
}

function AISuggestContent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userContext, setUserContext] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SuggestFormData>({
    defaultValues: {
      timeAvailable: 25,
    },
  });

  const generateMutation = useMutation(
    trpc.generateAIRitual.mutationOptions({
      onSuccess: (data) => {
        setSuggestions(data.suggestions);
        setUserContext(data.userContext);
        toast.success("AI suggestions generated!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate suggestions");
      },
    })
  );

  const createRitualMutation = useMutation(
    trpc.createRitual.mutationOptions({
      onSuccess: () => {
        toast.success("Ritual created!");
        navigate({ to: "/rituals" });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create ritual");
      },
    })
  );

  const onSubmit = (data: SuggestFormData) => {
    generateMutation.mutate({
      authToken: authToken!,
      goal: data.goal || undefined,
      timeAvailable: data.timeAvailable || undefined,
    });
  };

  const handleAdoptRitual = (suggestion: any) => {
    createRitualMutation.mutate({
      authToken: authToken!,
      name: suggestion.name,
      type: suggestion.type,
      duration: suggestion.duration,
      healthAdaptive: suggestion.healthAdaptive,
      voiceGuidance: false,
    });
  };

  return (
    <div className="min-h-screen bg-ritual-charcoal">
      {/* Header */}
      <div className="border-b border-ritual-indigo bg-ritual-charcoal-light">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/rituals" })}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="font-rounded text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-ritual-gold" />
                AI Ritual Designer
              </h1>
              <p className="text-gray-400 mt-1">Get personalized ritual suggestions based on your data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {!suggestions.length ? (
          // Input Form
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
                Tell us what you need
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="goal" className="mb-2 block font-semibold text-white">
                    What's your goal? (Optional)
                  </label>
                  <input
                    id="goal"
                    type="text"
                    {...register("goal")}
                    className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
                    placeholder="e.g., Deep work on a challenging project, Quick morning energizer..."
                  />
                  <p className="mt-2 text-sm text-gray-400">
                    Describe what you want to accomplish with this ritual
                  </p>
                </div>

                <div>
                  <label htmlFor="timeAvailable" className="mb-2 block font-semibold text-white">
                    Time Available (Optional)
                  </label>
                  <input
                    id="timeAvailable"
                    type="number"
                    {...register("timeAvailable", {
                      min: { value: 5, message: "Minimum 5 minutes" },
                      max: { value: 180, message: "Maximum 180 minutes" },
                    })}
                    className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
                    placeholder="25"
                  />
                  {errors.timeAvailable && (
                    <p className="mt-2 text-sm text-red-400">{errors.timeAvailable.message}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-400">
                    How many minutes do you have?
                  </p>
                </div>
              </div>
            </div>

            {userContext && (
              <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-blue/20 to-ritual-aurora-purple/20 p-6 border border-ritual-aurora-blue/30">
                <h3 className="font-semibold text-white mb-2">Your Patterns</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Avg Duration</p>
                    <p className="text-ritual-gold font-semibold">{userContext.avgDuration} min</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Best Hours</p>
                    <p className="text-ritual-gold font-semibold">
                      {userContext.bestHours.map((h: number) => `${h}:00`).join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">ADHD Profile</p>
                    <p className="text-ritual-gold font-semibold">
                      {userContext.hasADHDProfile ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={generateMutation.isPending}
              className="w-full rounded-xl bg-ritual-gold py-4 font-semibold text-ritual-charcoal transition-all duration-300 hover:scale-105 hover:bg-ritual-gold-light disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              {generateMutation.isPending ? "Generating..." : "Generate AI Suggestions"}
            </button>
          </form>
        ) : (
          // Suggestions Display
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-rounded text-2xl font-bold text-white">
                Your Personalized Rituals
              </h2>
              <button
                onClick={() => setSuggestions([])}
                className="rounded-lg bg-ritual-indigo px-4 py-2 text-white transition-colors hover:bg-ritual-indigo-light"
              >
                Generate New
              </button>
            </div>

            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="rounded-2xl bg-ritual-charcoal-light p-6 border-2 border-ritual-indigo hover:border-ritual-gold transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-rounded text-xl font-semibold text-white mb-1">
                      {suggestion.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="rounded-full bg-ritual-indigo px-3 py-1 text-ritual-gold capitalize">
                        {suggestion.type}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        {suggestion.duration} min
                      </span>
                      {suggestion.healthAdaptive && (
                        <span className="flex items-center gap-1 text-ritual-sage">
                          <Target className="h-4 w-4" />
                          Adaptive
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdoptRitual(suggestion)}
                    disabled={createRitualMutation.isPending}
                    className="rounded-lg bg-ritual-gold px-4 py-2 font-semibold text-ritual-charcoal transition-all hover:scale-105 hover:bg-ritual-gold-light disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Adopt
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-300 leading-relaxed">{suggestion.reasoning}</p>
                </div>

                {(suggestion.bestTimeOfDay || suggestion.soundscapeCategory) && (
                  <div className="flex gap-4 text-sm">
                    {suggestion.bestTimeOfDay && (
                      <div className="rounded-lg bg-ritual-charcoal px-3 py-2">
                        <span className="text-gray-400">Best time: </span>
                        <span className="text-ritual-gold font-semibold">{suggestion.bestTimeOfDay}</span>
                      </div>
                    )}
                    {suggestion.soundscapeCategory && (
                      <div className="rounded-lg bg-ritual-charcoal px-3 py-2">
                        <span className="text-gray-400">Soundscape: </span>
                        <span className="text-ritual-gold font-semibold">{suggestion.soundscapeCategory}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
