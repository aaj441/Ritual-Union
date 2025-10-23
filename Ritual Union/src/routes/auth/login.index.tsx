import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import toast from "react-hot-toast";

export const Route = createFileRoute("/auth/login/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  const loginMutation = useMutation(
    trpc.login.mutationOptions({
      onSuccess: (data) => {
        setAuth(data.authToken, data.user);
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      },
      onError: (error) => {
        toast.error(error.message || "Login failed");
      },
    })
  );

  const onSubmit = (data: { email: string; password: string }) => {
    loginMutation.mutate(data);
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
            Your sanctuary for sustainable productivity
          </p>
        </div>

        <div className="rounded-3xl bg-ritual-charcoal-light p-8 shadow-2xl">
          <h2 className="mb-6 font-rounded text-2xl font-semibold text-white">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                {...register("password", { required: "Password is required" })}
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
              disabled={loginMutation.isPending}
              className="w-full rounded-xl bg-ritual-gold py-3 font-semibold text-ritual-charcoal transition-all duration-300 hover:bg-ritual-gold-light disabled:opacity-50"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="font-semibold text-ritual-gold hover:text-ritual-gold-light"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Security & Privacy Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-ritual-sage" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure encryption • Your data is private</span>
          </div>
        </div>
      </div>
    </div>
  );
}
