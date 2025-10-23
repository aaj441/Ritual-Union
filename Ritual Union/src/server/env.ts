import { z } from "zod";
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string().optional(),
  JWT_SECRET: z.string(),
  OPENROUTER_API_KEY: z.string(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Email service (SendGrid, etc.)
  EMAIL_SERVICE_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().optional(),
  
  // Health data integrations
  APPLE_HEALTH_API_KEY: z.string().optional(),
  ANDROID_HEALTH_CONNECT_API_KEY: z.string().optional(),
  FITBIT_CLIENT_ID: z.string().optional(),
  FITBIT_CLIENT_SECRET: z.string().optional(),
  OURA_CLIENT_ID: z.string().optional(),
  OURA_CLIENT_SECRET: z.string().optional(),
  GOOGLE_FIT_CLIENT_ID: z.string().optional(),
  GOOGLE_FIT_CLIENT_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
