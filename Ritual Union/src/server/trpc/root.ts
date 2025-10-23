import {
  createCallerFactory,
  createTRPCRouter,
} from "~/server/trpc/main";

// Auth procedures
import { register } from "./procedures/auth/register";
import { login } from "./procedures/auth/login";

// User procedures
import { getProfile } from "./procedures/user/getProfile";
import { updateHealthConsent } from "./procedures/user/updateHealthConsent";
import { updateADHDProfile } from "./procedures/user/updateADHDProfile";

// Ritual procedures
import { getRituals } from "./procedures/rituals/getRituals";
import { createRitual } from "./procedures/rituals/createRitual";
import { updateRitual } from "./procedures/rituals/updateRitual";
import { deleteRitual } from "./procedures/rituals/deleteRitual";
import { reorderRituals } from "./procedures/rituals/reorderRituals";

// AI Ritual procedures
import { generateAIRitual } from "./procedures/rituals/generateAIRitual";

// Session procedures
import { startSession } from "./procedures/sessions/startSession";
import { completeSession } from "./procedures/sessions/completeSession";
import { getSessionHistory } from "./procedures/sessions/getSessionHistory";

// Soundscape procedures
import { getSoundscapes } from "./procedures/soundscapes/getSoundscapes";
import { getSoundscapePackages } from "./procedures/soundscapes/getSoundscapePackages";

// Health procedures
import { syncHealthData } from "./procedures/health/syncHealthData";
import { getHealthSnapshots } from "./procedures/health/getHealthSnapshots";

// Insights procedures
import { generateInsights } from "./procedures/insights/generateInsights";
import { getInsights } from "./procedures/insights/getInsights";
import { dismissInsight } from "./procedures/insights/dismissInsight";

// Subscription procedures
import { createCheckoutSession } from "./procedures/subscription/createCheckoutSession";
import { getSubscriptionStatus } from "./procedures/subscription/getSubscriptionStatus";
import { cancelSubscription } from "./procedures/subscription/cancelSubscription";

// Body Doubling procedures
import { createSession as createBodyDoublingSession } from "./procedures/bodyDoubling/createSession";
import { joinSession as joinBodyDoublingSession } from "./procedures/bodyDoubling/joinSession";
import { updateStatus as updateBodyDoublingStatus } from "./procedures/bodyDoubling/updateStatus";
import { sendMessage as sendBodyDoublingMessage } from "./procedures/bodyDoubling/sendMessage";
import { subscribeToSession as subscribeToBodyDoublingSession } from "./procedures/bodyDoubling/subscribeToSession";
import { getActiveSessions as getActiveBodyDoublingSessions } from "./procedures/bodyDoubling/getActiveSessions";

// Analytics procedures
import { exportData } from "./procedures/analytics/exportData";

// Challenge procedures
import { getChallenges } from "./procedures/challenges/getChallenges";

export const appRouter = createTRPCRouter({
  // Auth
  register,
  login,
  
  // User
  getProfile,
  updateHealthConsent,
  updateADHDProfile,
  
  // Rituals
  getRituals,
  createRitual,
  updateRitual,
  deleteRitual,
  reorderRituals,
  generateAIRitual,
  
  // Sessions
  startSession,
  completeSession,
  getSessionHistory,
  
  // Soundscapes
  getSoundscapes,
  getSoundscapePackages,
  
  // Health
  syncHealthData,
  getHealthSnapshots,
  
  // Insights
  generateInsights,
  getInsights,
  dismissInsight,
  
  // Subscription
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  
  // Body Doubling
  createBodyDoublingSession,
  joinBodyDoublingSession,
  updateBodyDoublingStatus,
  sendBodyDoublingMessage,
  subscribeToBodyDoublingSession,
  getActiveBodyDoublingSessions,
  
  // Analytics
  exportData,
  
  // Challenges
  getChallenges,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
