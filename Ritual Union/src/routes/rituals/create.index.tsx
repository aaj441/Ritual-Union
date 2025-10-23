import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { AuthGuard } from "~/components/AuthGuard";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/rituals/create/")({
  component: CreateRitualPage,
});

function CreateRitualPage() {
  return (
    <AuthGuard>
      <CreateRitualContent />
    </AuthGuard>
  );
}

interface RitualFormData {
  name: string;
  type: "focus" | "break" | "reflection" | "custom";
  duration: number;
  soundscapeId?: number;
  voiceGuidance: boolean;
  healthAdaptive: boolean;
}

function CreateRitualContent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);

  const soundscapesQuery = useQuery(
    trpc.getSoundscapes.queryOptions({})
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RitualFormData>({
    defaultValues: {
      type: "focus",
      duration: 25,
      voiceGuidance: false,
      healthAdaptive: false,
    },
  });

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

  const onSubmit = (data: RitualFormData) => {
    createRitualMutation.mutate({
      authToken: authToken!,
      name: data.name,
      type: data.type,
      duration: Number(data.duration),
      soundscapeId: data.soundscapeId ? Number(data.soundscapeId) : undefined,
      voiceGuidance: data.voiceGuidance,
      healthAdaptive: data.healthAdaptive,
    });
  };

  const selectedType = watch("type");

  return (
    <div className="min-h-screen bg-ritual-charcoal">
      {/* Header */}
      <div className="border-b border-ritual-indigo bg-ritual-charcoal-light">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/rituals" })}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="font-rounded text-3xl font-bold text-white">
              Create New Ritual
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Ritual Name */}
          <div className="rounded-2xl bg-ritual-charcoal-light p-6">
            <label
              htmlFor="name"
              className="mb-2 block font-semibold text-white"
            >
              Ritual Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
              placeholder="e.g., Morning Deep Work"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Ritual Type */}
          <div className="rounded-2xl bg-ritual-charcoal-light p-6">
            <label className="mb-4 block font-semibold text-white">
              Ritual Type
            </label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {["focus", "break", "reflection", "custom"].map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                    selectedType === type
                      ? "border-ritual-gold bg-ritual-gold/10"
                      : "border-ritual-indigo hover:border-ritual-gold/50"
                  }`}
                >
                  <input
                    type="radio"
                    value={type}
                    {...register("type")}
                    className="sr-only"
                  />
                  <div className="font-semibold capitalize text-white">
                    {type}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="rounded-2xl bg-ritual-charcoal-light p-6">
            <label
              htmlFor="duration"
              className="mb-2 block font-semibold text-white"
            >
              Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              {...register("duration", {
                required: "Duration is required",
                min: { value: 1, message: "Minimum 1 minute" },
                max: { value: 180, message: "Maximum 180 minutes" },
              })}
              className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
              placeholder="25"
            />
            {errors.duration && (
              <p className="mt-2 text-sm text-red-400">
                {errors.duration.message}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-400">
              Recommended: 25 min (Flow Mode), 50 min (Deep Mode)
            </p>
          </div>

          {/* Soundscape */}
          <div className="rounded-2xl bg-ritual-charcoal-light p-6">
            <label
              htmlFor="soundscapeId"
              className="mb-2 block font-semibold text-white"
            >
              Soundscape (Optional)
            </label>
            <select
              id="soundscapeId"
              {...register("soundscapeId")}
              className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
            >
              <option value="">No soundscape</option>
              {soundscapesQuery.data?.map((soundscape) => (
                <option key={soundscape.id} value={soundscape.id}>
                  {soundscape.name}
                  {soundscape.isPremium ? " (Premium)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Options */}
          <div className="rounded-2xl bg-ritual-charcoal-light p-6">
            <label className="mb-4 block font-semibold text-white">
              Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("voiceGuidance")}
                  className="h-5 w-5 rounded border-ritual-indigo bg-ritual-charcoal text-ritual-gold focus:ring-2 focus:ring-ritual-gold/20"
                />
                <div>
                  <div className="font-semibold text-white">Voice Guidance</div>
                  <div className="text-sm text-gray-400">
                    Receive spoken prompts during your ritual
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("healthAdaptive")}
                  className="h-5 w-5 rounded border-ritual-indigo bg-ritual-charcoal text-ritual-gold focus:ring-2 focus:ring-ritual-gold/20"
                />
                <div>
                  <div className="font-semibold text-white">
                    Health Adaptive
                  </div>
                  <div className="text-sm text-gray-400">
                    Adjust duration based on HRV and sleep quality
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate({ to: "/rituals" })}
              className="flex-1 rounded-xl border-2 border-ritual-indigo px-6 py-4 font-semibold text-white transition-all duration-300 hover:bg-ritual-indigo/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRitualMutation.isPending}
              className="flex-1 rounded-xl bg-ritual-gold px-6 py-4 font-semibold text-ritual-charcoal transition-all duration-300 hover:scale-105 hover:bg-ritual-gold-light disabled:opacity-50"
            >
              {createRitualMutation.isPending ? "Creating..." : "Create Ritual"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
