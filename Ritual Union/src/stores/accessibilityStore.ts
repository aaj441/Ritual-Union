import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AccessibilitySettings {
  // Visual settings (requests 19, 22)
  fontSize: "small" | "medium" | "large" | "extra-large";
  highContrastMode: boolean;
  reducedMotion: boolean;
  minimalMode: boolean;
  
  // Audio settings (requests 21, 22, 34)
  enableAudioCues: boolean;
  enableHapticFeedback: boolean;
  soundVariation: "full" | "minimal" | "silent";
  voiceGuidanceEnabled: boolean;
  voiceSpeed: number; // 0.5 to 2.0
  voiceTone: "calm" | "energetic" | "neutral";
  
  // ADHD settings (request 23)
  adhdMode: boolean;
  preferredPace: "slow" | "moderate" | "fast";
  reminderFrequency: "minimal" | "moderate" | "frequent";
  bodyDoublingEnabled: boolean;
  taskInitiationHelp: boolean;
  
  // Language (request 25)
  language: string;
  
  // Keyboard navigation (request 20)
  keyboardNavigationEnabled: boolean;
  showSkipLinks: boolean;
}

interface AccessibilityStore extends AccessibilitySettings {
  setFontSize: (size: AccessibilitySettings["fontSize"]) => void;
  setHighContrastMode: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setMinimalMode: (enabled: boolean) => void;
  setEnableAudioCues: (enabled: boolean) => void;
  setEnableHapticFeedback: (enabled: boolean) => void;
  setSoundVariation: (variation: AccessibilitySettings["soundVariation"]) => void;
  setVoiceGuidanceEnabled: (enabled: boolean) => void;
  setVoiceSpeed: (speed: number) => void;
  setVoiceTone: (tone: AccessibilitySettings["voiceTone"]) => void;
  setAdhdMode: (enabled: boolean) => void;
  setPreferredPace: (pace: AccessibilitySettings["preferredPace"]) => void;
  setReminderFrequency: (frequency: AccessibilitySettings["reminderFrequency"]) => void;
  setBodyDoublingEnabled: (enabled: boolean) => void;
  setTaskInitiationHelp: (enabled: boolean) => void;
  setLanguage: (language: string) => void;
  setKeyboardNavigationEnabled: (enabled: boolean) => void;
  setShowSkipLinks: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: "medium",
  highContrastMode: false,
  reducedMotion: false,
  minimalMode: false,
  enableAudioCues: true,
  enableHapticFeedback: true,
  soundVariation: "full",
  voiceGuidanceEnabled: false,
  voiceSpeed: 1.0,
  voiceTone: "calm",
  adhdMode: false,
  preferredPace: "moderate",
  reminderFrequency: "moderate",
  bodyDoublingEnabled: false,
  taskInitiationHelp: false,
  language: "en",
  keyboardNavigationEnabled: true,
  showSkipLinks: true,
};

export const useAccessibilityStore = create<AccessibilityStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setFontSize: (fontSize) => set({ fontSize }),
      setHighContrastMode: (highContrastMode) => set({ highContrastMode }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setMinimalMode: (minimalMode) => set({ minimalMode }),
      setEnableAudioCues: (enableAudioCues) => set({ enableAudioCues }),
      setEnableHapticFeedback: (enableHapticFeedback) => set({ enableHapticFeedback }),
      setSoundVariation: (soundVariation) => set({ soundVariation }),
      setVoiceGuidanceEnabled: (voiceGuidanceEnabled) => set({ voiceGuidanceEnabled }),
      setVoiceSpeed: (voiceSpeed) => set({ voiceSpeed }),
      setVoiceTone: (voiceTone) => set({ voiceTone }),
      setAdhdMode: (adhdMode) => set({ adhdMode }),
      setPreferredPace: (preferredPace) => set({ preferredPace }),
      setReminderFrequency: (reminderFrequency) => set({ reminderFrequency }),
      setBodyDoublingEnabled: (bodyDoublingEnabled) => set({ bodyDoublingEnabled }),
      setTaskInitiationHelp: (taskInitiationHelp) => set({ taskInitiationHelp }),
      setLanguage: (language) => set({ language }),
      setKeyboardNavigationEnabled: (keyboardNavigationEnabled) => set({ keyboardNavigationEnabled }),
      setShowSkipLinks: (showSkipLinks) => set({ showSkipLinks }),
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: "ritual-accessibility-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
