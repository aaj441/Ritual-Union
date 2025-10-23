import { db } from "~/server/db";
import { minioClient } from "~/server/minio";

async function setup() {
  // Create MinIO buckets
  const buckets = ["soundscapes", "voice-tracks", "user-exports", "backups"];
  for (const bucket of buckets) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket);
      console.log(`Created bucket: ${bucket}`);
      
      // Set public read policy for soundscapes and voice-tracks
      if (bucket === "soundscapes" || bucket === "voice-tracks") {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucket}/public/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
      }
    }
  }

  // Seed soundscapes if none exist
  const existingSoundscapes = await db.soundscape.count();
  if (existingSoundscapes === 0) {
    const soundscapes = [
      {
        name: "Forest Rain",
        category: "Nature",
        isPremium: false,
        audioUrl: "/soundscapes/public/forest-rain.mp3",
        duration: 3600,
        tags: ["rain", "forest", "nature", "calming"],
      },
      {
        name: "Ocean Waves",
        category: "Nature",
        isPremium: false,
        audioUrl: "/soundscapes/public/ocean-waves.mp3",
        duration: 3600,
        tags: ["ocean", "waves", "water", "peaceful"],
      },
      {
        name: "Café Ambience",
        category: "Urban",
        isPremium: false,
        audioUrl: "/soundscapes/public/cafe-ambience.mp3",
        duration: 3600,
        tags: ["cafe", "coffee", "chatter", "urban"],
      },
      {
        name: "White Noise",
        category: "Technical",
        isPremium: false,
        audioUrl: "/soundscapes/public/white-noise.mp3",
        duration: 3600,
        tags: ["white noise", "static", "focus"],
      },
      {
        name: "Brown Noise",
        category: "Technical",
        isPremium: false,
        audioUrl: "/soundscapes/public/brown-noise.mp3",
        duration: 3600,
        tags: ["brown noise", "deep", "focus"],
      },
      {
        name: "Binaural Beats - Focus",
        category: "Focus Frequencies",
        isPremium: true,
        audioUrl: "/soundscapes/public/binaural-focus.mp3",
        duration: 3600,
        tags: ["binaural", "beta waves", "focus", "productivity"],
      },
      {
        name: "Thunderstorm",
        category: "Nature",
        isPremium: true,
        audioUrl: "/soundscapes/public/thunderstorm.mp3",
        duration: 3600,
        tags: ["thunder", "rain", "storm", "intense"],
      },
      {
        name: "Tokyo Streets",
        category: "Urban Sanctuary",
        isPremium: true,
        audioUrl: "/soundscapes/public/tokyo-streets.mp3",
        duration: 3600,
        artist: "Urban Soundscapes Collective",
        culturalOrigin: "Japan",
        tags: ["tokyo", "urban", "city", "ambient"],
      },
    ];

    await db.soundscape.createMany({
      data: soundscapes,
    });
    console.log(`Seeded ${soundscapes.length} soundscapes`);
  }

  // Seed achievements if none exist
  const existingAchievements = await db.achievement.count();
  if (existingAchievements === 0) {
    const achievements = [
      {
        name: "First Steps",
        description: "Complete your first focus session",
        icon: "🎯",
        category: "completion",
        triggerType: "session_count",
        triggerValue: 1,
      },
      {
        name: "Getting Started",
        description: "Complete 5 focus sessions",
        icon: "⚡",
        category: "completion",
        triggerType: "session_count",
        triggerValue: 5,
      },
      {
        name: "Focus Master",
        description: "Complete 10 deep work sessions",
        icon: "🔥",
        category: "completion",
        triggerType: "session_count",
        triggerValue: 10,
      },
      {
        name: "Consistency Champion",
        description: "Maintain a 7-day streak",
        icon: "🌟",
        category: "streak",
        triggerType: "streak_days",
        triggerValue: 7,
      },
      {
        name: "Marathon Runner",
        description: "Maintain a 30-day streak",
        icon: "🏆",
        category: "streak",
        triggerType: "streak_days",
        triggerValue: 30,
      },
      {
        name: "Early Bird",
        description: "Complete 5 morning sessions (before 9 AM)",
        icon: "🌅",
        category: "completion",
        triggerType: "session_count",
        triggerValue: 5,
      },
      {
        name: "Time Invested",
        description: "Accumulate 10 hours of focus time",
        icon: "⏱️",
        category: "time",
        triggerType: "total_minutes",
        triggerValue: 600,
      },
      {
        name: "Deep Work Devotee",
        description: "Accumulate 50 hours of focus time",
        icon: "💪",
        category: "time",
        triggerType: "total_minutes",
        triggerValue: 3000,
      },
    ];

    await db.achievement.createMany({
      data: achievements,
    });
    console.log(`Seeded ${achievements.length} achievements`);
  }

  // Seed voice tracks if none exist
  const existingVoiceTracks = await db.voiceTrack.count();
  if (existingVoiceTracks === 0) {
    const voiceTracks = [
      {
        name: "Gentle Focus Meditation",
        description: "A calming voice guide to ease into deep work",
        audioUrl: "/voice-tracks/public/gentle-focus.mp3",
        duration: 300, // 5 minutes
        tone: "calm",
        accent: "neutral",
        isPremium: false,
        category: "focus",
      },
      {
        name: "Energy Boost Break",
        description: "An energizing voice guide for your break time",
        audioUrl: "/voice-tracks/public/energy-boost.mp3",
        duration: 180, // 3 minutes
        tone: "energetic",
        accent: "american",
        isPremium: false,
        category: "break",
      },
      {
        name: "Deep Work Immersion",
        description: "Advanced focus techniques for sustained concentration",
        audioUrl: "/voice-tracks/public/deep-work.mp3",
        duration: 600, // 10 minutes
        tone: "calm",
        accent: "british",
        isPremium: true,
        category: "focus",
      },
      {
        name: "Evening Reflection",
        description: "Guided reflection on your day's accomplishments",
        audioUrl: "/voice-tracks/public/evening-reflection.mp3",
        duration: 420, // 7 minutes
        tone: "calm",
        accent: "neutral",
        isPremium: true,
        category: "reflection",
      },
    ];

    await db.voiceTrack.createMany({
      data: voiceTracks,
    });
    console.log(`Seeded ${voiceTracks.length} voice tracks`);
  }

  // Seed soundscape packs if none exist
  const existingPacks = await db.soundscapePack.count();
  if (existingPacks === 0) {
    // Get soundscape IDs for pack creation
    const allSoundscapes = await db.soundscape.findMany();
    
    if (allSoundscapes.length > 0) {
      const naturePack = await db.soundscapePack.create({
        data: {
          name: "Nature Immersion Bundle",
          description: "A collection of premium nature soundscapes for deep focus",
          price: 1499, // $14.99
          isPremium: true,
          imageUrl: "/images/packs/nature-bundle.jpg",
        },
      });

      // Add soundscapes to the pack
      const natureScapes = allSoundscapes.filter(s => 
        s.category === "Nature" && s.isPremium
      );
      
      for (let i = 0; i < natureScapes.length; i++) {
        const soundscape = natureScapes[i];
        if (soundscape) {
          await db.soundscapePackItem.create({
            data: {
              packId: naturePack.id,
              soundscapeId: soundscape.id,
              orderIndex: i,
            },
          });
        }
      }

      console.log("Seeded soundscape packs");
    }
  }
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
