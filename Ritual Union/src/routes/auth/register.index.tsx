import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import toast from "react-hot-toast";

export const Route = createFileRoute("/auth/register/")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string; name: string }>();

  const registerMutation = useMutation(
    trpc.register.mutationOptions({
      onSuccess: (data) => {
        setAuth(data.authToken, data.user);
        toast.success("Welcome to Ritual Engine!");
        navigate({ to: "/dashboard" });
      },
      onError: (error) => {
        toast.error(error.message || "Registration failed");
      },
    })
  );

  const onSubmit = (data: { email: string; password: string; name: string }) => {
    registerMutation.mutate({
      ...data,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ritual-charcoal p-4">
      <div className="absolute inset-0 bg-aurora-gradient opacity-5"></div>
      
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-rounded text-4xl font-bold text-ritual-gold">
            Ritual Engine
          </h1>
          <p className="mt-2 text-ritual-sage">
            Begin your journey to sustainable productivity
          </p>
        </div>

        <div className="rounded-3xl bg-ritual-charcoal-light p-8 shadow-2xl">
          <h2 className="mb-6 font-rounded text-2xl font-semibold text-white">
            Create Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-xl bg-ritual-gold py-3 font-semibold text-ritual-charcoal transition-all duration-300 hover:bg-ritual-gold-light disabled:opacity-50"
            >
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="font-semibold text-ritual-gold hover:text-ritual-gold-light"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Privacy Statement */}
          <div className="mt-6 rounded-xl bg-ritual-charcoal/50 p-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account, you agree to our Terms of Service. We respect your privacy and will never share your personal information. Your health data is encrypted and stored securely.
            </p>
          </div>

          {/* Security Badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-ritual-sage" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-ritual-sage" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
