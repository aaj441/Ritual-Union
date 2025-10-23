import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { useAccessibilityStore } from "~/stores/accessibilityStore";
import { AuthGuard } from "~/components/AuthGuard";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

function SettingsContent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const user = useAuthStore((state) => state.user);

  // Accessibility store
  const {
    fontSize,
    setFontSize,
    highContrastMode,
    setHighContrastMode,
    reducedMotion,
    setReducedMotion,
    minimalMode,
    setMinimalMode,
    enableAudioCues,
    setEnableAudioCues,
    enableHapticFeedback,
    setEnableHapticFeedback,
    soundVariation,
    setSoundVariation,
    voiceGuidanceEnabled,
    setVoiceGuidanceEnabled,
    voiceSpeed,
    setVoiceSpeed,
    voiceTone,
    setVoiceTone,
    adhdMode,
    setAdhdMode,
    preferredPace,
    setPreferredPace,
    reminderFrequency,
    setReminderFrequency,
    bodyDoublingEnabled,
    setBodyDoublingEnabled,
    taskInitiationHelp,
    setTaskInitiationHelp,
    language,
    setLanguage,
    resetToDefaults,
  } = useAccessibilityStore();

  const [activeTab, setActiveTab] = useState<"accessibility" | "adhd" | "health" | "voice">("accessibility");

  // Fetch user profile
  const profileQuery = useQuery(
    trpc.getProfile.queryOptions({ authToken: authToken! })
  );

  // Health consent mutation
  const updateHealthConsentMutation = useMutation(
    trpc.updateHealthConsent.mutationOptions({
      onSuccess: () => {
        toast.success("Health data consent updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  // ADHD profile mutation
  const updateADHDProfileMutation = useMutation(
    trpc.updateADHDProfile.mutationOptions({
      onSuccess: () => {
        toast.success("ADHD profile updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleHealthConsentToggle = async (consent: boolean) => {
    await updateHealthConsentMutation.mutateAsync({
      authToken: authToken!,
      consent,
    });
  };

  const handleADHDProfileUpdate = async (data: {
    diagnosisStatus?: "diagnosed" | "self_identified" | "exploring";
    primaryChallenges?: string[];
    accommodations?: string[];
  }) => {
    await updateADHDProfileMutation.mutateAsync({
      authToken: authToken!,
      ...data,
    });
  };

  return (
    <div className="min-h-screen bg-ritual-charcoal">
      {/* Header */}
      <div className="border-b border-ritual-indigo bg-ritual-charcoal-light">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="font-rounded text-3xl font-bold text-white">
              Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("accessibility")}
            className={`rounded-xl px-6 py-3 font-semibold transition-colors ${
              activeTab === "accessibility"
                ? "bg-ritual-gold text-ritual-charcoal"
                : "bg-ritual-charcoal-light text-gray-400 hover:text-white"
            }`}
          >
            Accessibility
          </button>
          <button
            onClick={() => setActiveTab("adhd")}
            className={`rounded-xl px-6 py-3 font-semibold transition-colors ${
              activeTab === "adhd"
                ? "bg-ritual-gold text-ritual-charcoal"
                : "bg-ritual-charcoal-light text-gray-400 hover:text-white"
            }`}
          >
            ADHD Support
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`rounded-xl px-6 py-3 font-semibold transition-colors ${
              activeTab === "health"
                ? "bg-ritual-gold text-ritual-charcoal"
                : "bg-ritual-charcoal-light text-gray-400 hover:text-white"
            }`}
          >
            Health Data
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`rounded-xl px-6 py-3 font-semibold transition-colors ${
              activeTab === "voice"
                ? "bg-ritual-gold text-ritual-charcoal"
                : "bg-ritual-charcoal-light text-gray-400 hover:text-white"
            }`}
          >
            Voice Guidance
          </button>
        </div>

        {/* Accessibility Tab */}
        {activeTab === "accessibility" && (
          <div className="space-y-6">
            {/* Visual Settings */}
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
                Visual Settings
              </h2>
              
              <div className="space-y-4">
                {/* Font Size */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ritual-sage">
                    Font Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["small", "medium", "large", "extra-large"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`rounded-lg px-4 py-2 font-semibold capitalize transition-colors ${
                          fontSize === size
                            ? "bg-ritual-gold text-ritual-charcoal"
                            : "bg-ritual-charcoal text-gray-400 hover:text-white"
                        }`}
                      >
                        {size === "extra-large" ? "XL" : size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Settings */}
                <ToggleSetting
                  label="High Contrast Mode"
                  description="Increase contrast for better visibility"
                  enabled={highContrastMode}
                  onChange={setHighContrastMode}
                />
                
                <ToggleSetting
                  label="Reduced Motion"
                  description="Minimize animations and transitions"
                  enabled={reducedMotion}
                  onChange={setReducedMotion}
                />
                
                <ToggleSetting
                  label="Minimal Mode"
                  description="Simplified interface with fewer distractions"
                  enabled={minimalMode}
                  onChange={setMinimalMode}
                />
              </div>
            </div>

            {/* Audio & Haptic Settings */}
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
                Audio & Haptic
              </h2>
              
              <div className="space-y-4">
                <ToggleSetting
                  label="Audio Cues"
                  description="Play sounds for ritual transitions and completions"
                  enabled={enableAudioCues}
                  onChange={setEnableAudioCues}
                />
                
                <ToggleSetting
                  label="Haptic Feedback"
                  description="Vibration feedback for interactions"
                  enabled={enableHapticFeedback}
                  onChange={setEnableHapticFeedback}
                />
                
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ritual-sage">
                    Sound Variation
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["full", "minimal", "silent"] as const).map((variation) => (
                      <button
                        key={variation}
                        onClick={() => setSoundVariation(variation)}
                        className={`rounded-lg px-4 py-2 font-semibold capitalize transition-colors ${
                          soundVariation === variation
                            ? "bg-ritual-gold text-ritual-charcoal"
                            : "bg-ritual-charcoal text-gray-400 hover:text-white"
                        }`}
                      >
                        {variation}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
                Language
              </h2>
              
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg bg-ritual-charcoal px-4 py-3 text-white"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                resetToDefaults();
                toast.success("Settings reset to defaults");
              }}
              className="w-full rounded-xl bg-ritual-indigo px-6 py-3 font-semibold text-white transition-colors hover:bg-ritual-indigo-light"
            >
              Reset to Defaults
            </button>
          </div>
        )}

        {/* ADHD Support Tab */}
        {activeTab === "adhd" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
                ADHD Profile
              </h2>
              
              <div className="space-y-4">
                <ToggleSetting
                  label="ADHD Mode"
                  description="Enable ADHD-specific features and accommodations"
                  enabled={adhdMode}
                  onChange={setAdhdMode}
                />
                
                {adhdMode && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ritual-sage">
                        Preferred Pace
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["slow", "moderate", "fast"] as const).map((pace) => (
                          <button
                            key={pace}
                            onClick={() => setPreferredPace(pace)}
                            className={`rounded-lg px-4 py-2 font-semibold capitalize transition-colors ${
                              preferredPace === pace
                                ? "bg-ritual-gold text-ritual-charcoal"
                                : "bg-ritual-charcoal text-gray-400 hover:text-white"
                            }`}
                          >
                            {pace}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ritual-sage">
                        Reminder Frequency
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["minimal", "moderate", "frequent"] as const).map((freq) => (
                          <button
                            key={freq}
                            onClick={() => setReminderFrequency(freq)}
                            className={`rounded-lg px-4 py-2 font-semibold capitalize transition-colors ${
                              reminderFrequency === freq
                                ? "bg-ritual-gold text-ritual-charcoal"
                                : "bg-ritual-charcoal text-gray-400 hover:text-white"
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>

                    <ToggleSetting
                      label="Body Doubling"
                      description="Enable virtual co-working sessions"
                      enabled={bodyDoublingEnabled}
                      onChange={setBodyDoublingEnabled}
                    />
                    
                    <ToggleSetting
                      label="Task Initiation Help"
                      description="Extra prompts and support for starting tasks"
                      enabled={taskInitiationHelp}
                      onChange={setTaskInitiationHelp}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Health Data Tab */}
        {activeTab === "health" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
                Health Data Privacy
              </h2>
              
              <div className="mb-6 rounded-xl bg-ritual-indigo/20 p-4 text-sm text-gray-300">
                <p className="mb-2">
                  🔒 Your health data is encrypted and stored securely. We never share your personal health information with third parties.
                </p>
                <p>
                  You can revoke consent at any time. This will stop new data collection, and you can optionally delete existing data.
                </p>
              </div>

              <ToggleSetting
                label="Health Data Collection"
                description="Allow Ritual Engine to sync and analyze health data for adaptive features"
                enabled={profileQuery.data?.healthDataConsent || false}
                onChange={handleHealthConsentToggle}
              />
            </div>

            {profileQuery.data?.healthDataConsent && (
              <div className="rounded-2xl bg-ritual-charcoal-light p-6">
                <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
                  Connected Sources
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-ritual-charcoal p-4">
                    <div>
                      <p className="font-semibold text-white">Apple HealthKit</p>
                      <p className="text-sm text-gray-400">Not connected</p>
                    </div>
                    <button className="rounded-lg bg-ritual-gold px-4 py-2 font-semibold text-ritual-charcoal transition-colors hover:bg-ritual-gold-light">
                      Connect
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-xl bg-ritual-charcoal p-4">
                    <div>
                      <p className="font-semibold text-white">Google Fit</p>
                      <p className="text-sm text-gray-400">Not connected</p>
                    </div>
                    <button className="rounded-lg bg-ritual-gold px-4 py-2 font-semibold text-ritual-charcoal transition-colors hover:bg-ritual-gold-light">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Guidance Tab */}
        {activeTab === "voice" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-ritual-charcoal-light p-6">
              <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
                Voice Guidance Settings
              </h2>
              
              <div className="space-y-4">
                <ToggleSetting
                  label="Voice Guidance"
                  description="Enable guided voice instructions during rituals"
                  enabled={voiceGuidanceEnabled}
                  onChange={setVoiceGuidanceEnabled}
                />
                
                {voiceGuidanceEnabled && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ritual-sage">
                        Voice Speed: {voiceSpeed.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="mt-1 flex justify-between text-xs text-gray-400">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ritual-sage">
                        Voice Tone
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["calm", "energetic", "neutral"] as const).map((tone) => (
                          <button
                            key={tone}
                            onClick={() => setVoiceTone(tone)}
                            className={`rounded-lg px-4 py-2 font-semibold capitalize transition-colors ${
                              voiceTone === tone
                                ? "bg-ritual-gold text-ritual-charcoal"
                                : "bg-ritual-charcoal text-gray-400 hover:text-white"
                            }`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="font-semibold text-white">{label}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`ml-4 flex h-8 w-14 items-center rounded-full transition-colors ${
          enabled ? "bg-ritual-gold" : "bg-ritual-charcoal"
        }`}
      >
        <div
          className={`h-6 w-6 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
