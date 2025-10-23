import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { TRPCReactProvider } from "~/trpc/react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  if (isFetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-ritual-charcoal">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-ritual-indigo border-t-ritual-gold"></div>
          <p className="font-rounded text-lg text-ritual-gold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TRPCReactProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#2D3561",
            color: "#F4C430",
            borderRadius: "12px",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <Outlet />
    </TRPCReactProvider>
  );
}
