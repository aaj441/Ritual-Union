import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { AuthGuard } from "~/components/AuthGuard";
import { ProgressRing } from "~/components/ProgressRing";
import { Pause, Play, X } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";

const timerSearchSchema = z.object({
  sessionId: z.number(),
});

export const Route = createFileRoute("/timer/")({
  component: TimerPage,
  validateSearch: timerSearchSchema,
});

function TimerPage() {
  return (
    <AuthGuard>
      <TimerContent />
    </AuthGuard>
  );
}

function TimerContent() {
  const navigate = useNavigate();
  const { sessionId } = Route.useSearch();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [totalTime] = useState(25 * 60);

  const completeSessionMutation = useMutation(
    trpc.completeSession.mutationOptions({
      onSuccess: () => {
        toast.success("Session completed!");
        navigate({ to: "/dashboard" });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to complete session");
      },
    })
  );

  const handleComplete = useCallback((completed: boolean) => {
    completeSessionMutation.mutate({
      authToken: authToken!,
      sessionId,
      completed,
      hrvEnd: 68,
      avgHeartRate: 72,
    });
  }, [authToken, sessionId, completeSessionMutation]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeRemaining, handleComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  const getEncouragementMessage = () => {
    if (progress < 25) {
      return "You've got this. Just getting started. 🌱";
    } else if (progress < 50) {
      return "Great momentum! You're in the flow. 🌊";
    } else if (progress < 75) {
      return "Over halfway there! Stay present. ✨";
    } else if (progress < 90) {
      return "Almost there! Feel the energy. ⚡";
    } else {
      return "Final stretch! You're doing amazing. 🎯";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ritual-charcoal">
      <div className="absolute inset-0 bg-aurora-gradient opacity-5"></div>

      <div className="relative w-full max-w-2xl px-4">
        {/* Ambient glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ritual-aurora-blue/10 rounded-full blur-3xl animate-glow"></div>

        {/* Controls */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to end this session?")) {
                handleComplete(false);
              }
            }}
            className="rounded-full p-3 text-gray-400 transition-colors hover:bg-ritual-charcoal-light hover:text-red-400"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-400">Focus Session</p>
            <p className="font-semibold text-ritual-gold">Deep Work Mode</p>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Timer */}
        <div className="mb-8 flex items-center justify-center">
          <ProgressRing progress={progress} size={300} strokeWidth={16}>
            <div className="text-center animate-breath">
              <div className="font-mono text-6xl font-bold text-ritual-gold">
                {formatTime(timeRemaining)}
              </div>
              <div className="mt-2 text-sm text-gray-400">remaining</div>
              {isPaused && (
                <div className="mt-2 text-xs text-ritual-sage">Paused</div>
              )}
            </div>
          </ProgressRing>
        </div>

        {/* Soundscape Info */}
        <div className="mb-8 rounded-3xl bg-ritual-charcoal-light p-6 text-center">
          <div className="mb-2 text-4xl">🌊</div>
          <p className="font-semibold text-white">Ocean Waves</p>
          <p className="text-sm text-gray-400">Playing...</p>
        </div>

        {/* Pause/Resume Button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-full rounded-xl bg-ritual-gold py-4 font-semibold text-ritual-charcoal transition-all duration-300 hover:scale-105 hover:bg-ritual-gold-light"
        >
          {isPaused ? (
            <>
              <Play className="mr-2 inline h-5 w-5" fill="currentColor" />
              Resume
            </>
          ) : (
            <>
              <Pause className="mr-2 inline h-5 w-5" />
              Pause
            </>
          )}
        </button>

        {/* Encouragement with Progress Milestones */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-400">
            You're {Math.round(progress)}% through this focus block.
          </p>
          <p className="text-lg text-ritual-gold font-semibold animate-pulse">
            {getEncouragementMessage()}
          </p>
          
          {/* Progress Milestones */}
          <div className="flex justify-center gap-2 mt-4">
            {[25, 50, 75, 100].map((milestone) => (
              <div
                key={milestone}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  progress >= milestone
                    ? "bg-ritual-gold scale-125"
                    : "bg-ritual-charcoal-light"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Biometrics */}
        <div className="mt-8 flex justify-center gap-8 text-sm">
          <div className="text-center">
            <p className="text-gray-400">HRV</p>
            <p className="font-semibold text-ritual-sage">Steady</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Heart Rate</p>
            <p className="font-semibold text-ritual-sage">68 bpm</p>
          </div>
        </div>
      </div>
    </div>
  );
}
