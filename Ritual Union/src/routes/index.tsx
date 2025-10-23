import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "~/stores/authStore";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ritual-charcoal">
      <div className="absolute inset-0 bg-aurora-gradient opacity-10"></div>
      
      {/* Hero Section */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-block rounded-full bg-ritual-gold/10 px-6 py-2 text-sm font-semibold text-ritual-gold">
            ✨ The Future of Mindful Productivity
          </div>
          <h1 className="font-rounded text-6xl font-bold text-ritual-gold animate-float">
            Ritual Union
          </h1>
          <p className="mt-6 text-2xl font-semibold text-white">
            Transform your daily practice into lasting change
          </p>
          <p className="mt-4 text-xl text-ritual-sage">
            An ADHD-optimized wellness platform that syncs rituals with your biology
          </p>
          <p className="mt-3 max-w-2xl text-lg text-gray-400">
            Eliminate burnout. Reduce friction. Raise your focus. Create sustainable habits that honor your neurodivergent brain.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            to="/auth/register"
            className="rounded-xl bg-ritual-gold px-8 py-4 font-semibold text-ritual-charcoal transition-all duration-300 hover:scale-105 hover:bg-ritual-gold-light shadow-lg shadow-ritual-gold/20"
          >
            Start Your Journey
          </Link>
          <Link
            to="/auth/login"
            className="rounded-xl border-2 border-ritual-gold px-8 py-4 font-semibold text-ritual-gold transition-all duration-300 hover:bg-ritual-gold/10"
          >
            Sign In
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <div className="text-sm text-gray-500">Discover more ↓</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-rounded text-4xl font-bold text-white">
              Why Ritual Union?
            </h2>
            <p className="mt-4 text-xl text-ritual-sage">
              We've eliminated what doesn't work and created what does
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-ritual-charcoal-light p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-ritual-gold/10">
              <div className="mb-6 text-5xl">🧠</div>
              <h3 className="font-rounded text-xl font-semibold text-white mb-4">
                ADHD-First Design
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Built specifically for neurodivergent brains. No overwhelming interfaces, no guilt-inducing trackers—just gentle, effective support for your executive function.
              </p>
            </div>

            <div className="rounded-2xl bg-ritual-charcoal-light p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-ritual-gold/10">
              <div className="mb-6 text-5xl">❤️</div>
              <h3 className="font-rounded text-xl font-semibold text-white mb-4">
                Biometric Wisdom
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your body knows when you're ready for deep work. We adapt to your HRV, sleep quality, and energy levels—so you can work with your biology, not against it.
              </p>
            </div>

            <div className="rounded-2xl bg-ritual-charcoal-light p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-ritual-gold/10">
              <div className="mb-6 text-5xl">🎵</div>
              <h3 className="font-rounded text-xl font-semibold text-white mb-4">
                Immersive Soundscapes
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Curated audio environments from calming nature sounds to focus-enhancing binaural beats. Transform any space into your personal sanctuary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative px-4 py-20 bg-ritual-charcoal-light/30">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="font-rounded text-4xl font-bold text-white">
              Your Path to Transformation
            </h2>
            <p className="mt-4 text-xl text-ritual-sage">
              Simple steps, profound results
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ritual-gold flex items-center justify-center font-bold text-ritual-charcoal">
                1
              </div>
              <div>
                <h3 className="font-rounded text-xl font-semibold text-white mb-2">
                  Create Your Rituals
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Choose from our curated defaults or customize your own. Whether it's a morning meditation, deep work session, or evening wind-down, make it yours.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ritual-gold flex items-center justify-center font-bold text-ritual-charcoal">
                2
              </div>
              <div>
                <h3 className="font-rounded text-xl font-semibold text-white mb-2">
                  Sync with Your Body
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Our AI analyzes your health data to recommend the perfect time for each ritual. Work when your body is ready, rest when it needs recovery.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ritual-gold flex items-center justify-center font-bold text-ritual-charcoal">
                3
              </div>
              <div>
                <h3 className="font-rounded text-xl font-semibold text-white mb-2">
                  Experience Immersive Focus
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Beautiful timers, calming soundscapes, and gentle guidance keep you in flow. No harsh alarms, no productivity guilt—just presence.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ritual-gold flex items-center justify-center font-bold text-ritual-charcoal">
                4
              </div>
              <div>
                <h3 className="font-rounded text-xl font-semibold text-white mb-2">
                  Celebrate Your Progress
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Track meaningful metrics, discover patterns, and receive AI-powered insights. See how your rituals transform into lasting habits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-rounded text-4xl font-bold text-white">
              Transforming Lives Daily
            </h2>
            <p className="mt-4 text-xl text-ritual-sage">
              Real stories from our community
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-purple/20 to-ritual-aurora-blue/20 p-8">
              <div className="mb-4 flex gap-1 text-ritual-gold">
                {"⭐".repeat(5)}
              </div>
              <p className="mb-6 text-gray-300 leading-relaxed">
                "Finally, a productivity app that doesn't make me feel like I'm failing. The ADHD-friendly design and biometric tracking have completely changed how I approach my work."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ritual-gold/20 flex items-center justify-center text-ritual-gold font-semibold">
                  S
                </div>
                <div>
                  <p className="font-semibold text-white">Sarah M.</p>
                  <p className="text-sm text-gray-400">Software Developer</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-blue/20 to-ritual-aurora-green/20 p-8">
              <div className="mb-4 flex gap-1 text-ritual-gold">
                {"⭐".repeat(5)}
              </div>
              <p className="mb-6 text-gray-300 leading-relaxed">
                "The soundscapes and gentle timers help me get into flow states I didn't think were possible with ADHD. I've completed more deep work in 3 weeks than in 3 months before."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ritual-gold/20 flex items-center justify-center text-ritual-gold font-semibold">
                  M
                </div>
                <div>
                  <p className="font-semibold text-white">Marcus T.</p>
                  <p className="text-sm text-gray-400">Creative Director</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-ritual-aurora-green/20 to-ritual-aurora-purple/20 p-8">
              <div className="mb-4 flex gap-1 text-ritual-gold">
                {"⭐".repeat(5)}
              </div>
              <p className="mb-6 text-gray-300 leading-relaxed">
                "This isn't just another app—it's a complete shift in how I relate to my work and rest. The AI insights showed me patterns I never would have noticed on my own."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ritual-gold/20 flex items-center justify-center text-ritual-gold font-semibold">
                  A
                </div>
                <div>
                  <p className="font-semibold text-white">Alex K.</p>
                  <p className="text-sm text-gray-400">Entrepreneur</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative px-4 py-20 bg-gradient-to-br from-ritual-indigo/30 to-ritual-aurora-purple/30">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-rounded text-5xl font-bold text-white mb-6">
            Ready to Transform Your Daily Practice?
          </h2>
          <p className="text-xl text-ritual-sage mb-8">
            Join thousands who've discovered sustainable productivity
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/auth/register"
              className="rounded-xl bg-ritual-gold px-10 py-5 text-lg font-semibold text-ritual-charcoal transition-all duration-300 hover:scale-105 hover:bg-ritual-gold-light shadow-2xl shadow-ritual-gold/30"
            >
              Start Free Today
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
