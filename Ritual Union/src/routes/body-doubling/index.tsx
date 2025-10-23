import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/authStore";
import { useAccessibilityStore } from "~/stores/accessibilityStore";
import { AuthGuard } from "~/components/AuthGuard";
import { ArrowLeft, Users, Plus, Clock, UserCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/body-doubling/")({
  component: BodyDoublingPage,
});

function BodyDoublingPage() {
  return (
    <AuthGuard>
      <BodyDoublingContent />
    </AuthGuard>
  );
}

function BodyDoublingContent() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const authToken = useAuthStore((state) => state.authToken);
  const bodyDoublingEnabled = useAccessibilityStore((state) => state.bodyDoublingEnabled);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sessionName, setSessionName] = useState("");

  const activeSessionsQuery = useQuery(
    trpc.getActiveBodyDoublingSessions.queryOptions({
      authToken: authToken!,
    })
  );

  const createSessionMutation = useMutation(
    trpc.createBodyDoublingSession.mutationOptions({
      onSuccess: (data) => {
        toast.success("Session created!");
        navigate({ to: "/body-doubling/$sessionId", params: { sessionId: String(data.session.id) } });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create session");
      },
    })
  );

  const joinSessionMutation = useMutation(
    trpc.joinBodyDoublingSession.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success("Joined session!");
        navigate({ to: "/body-doubling/$sessionId", params: { sessionId: String(variables.sessionId) } });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to join session");
      },
    })
  );

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      toast.error("Please enter a session name");
      return;
    }
    createSessionMutation.mutate({
      authToken: authToken!,
      name: sessionName,
      maxParticipants: 10,
    });
  };

  const handleJoinSession = (sessionId: number) => {
    joinSessionMutation.mutate({
      authToken: authToken!,
      sessionId,
    });
  };

  if (!bodyDoublingEnabled) {
    return (
      <div className="min-h-screen bg-ritual-charcoal">
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
                Body Doubling
              </h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="rounded-2xl bg-ritual-charcoal-light p-12">
            <Users className="mx-auto h-16 w-16 text-ritual-gold mb-4" />
            <h2 className="font-rounded text-2xl font-bold text-white mb-4">
              Body Doubling is Disabled
            </h2>
            <p className="text-gray-400 mb-6">
              Enable body doubling in your settings to join virtual co-working sessions
            </p>
            <button
              onClick={() => navigate({ to: "/settings" })}
              className="rounded-xl bg-ritual-gold px-6 py-3 font-semibold text-ritual-charcoal transition-all hover:scale-105 hover:bg-ritual-gold-light"
            >
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ritual-charcoal">
      {/* Header */}
      <div className="border-b border-ritual-indigo bg-ritual-charcoal-light">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-ritual-indigo/20 hover:text-ritual-gold"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="font-rounded text-3xl font-bold text-white">
                  Body Doubling
                </h1>
                <p className="text-gray-400 mt-1">Virtual co-working sessions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl bg-ritual-gold px-6 py-3 font-semibold text-ritual-charcoal transition-all hover:scale-105 hover:bg-ritual-gold-light flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Session
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-ritual-aurora-blue/20 to-ritual-aurora-purple/20 p-6 border border-ritual-aurora-blue/30">
          <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-ritual-gold" />
            What is Body Doubling?
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Body doubling is a productivity technique where you work alongside others in real-time, 
            even virtually. It helps with focus, accountability, and motivation—especially beneficial 
            for people with ADHD. Join a session to work together in comfortable silence or with 
            occasional encouragement.
          </p>
        </div>

        {/* Active Sessions */}
        <h2 className="mb-4 font-rounded text-xl font-semibold text-white">
          Active Sessions
        </h2>
        
        {activeSessionsQuery.isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading sessions...</div>
        ) : activeSessionsQuery.data?.sessions.length === 0 ? (
          <div className="rounded-2xl bg-ritual-charcoal-light p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 mb-4">No active sessions right now</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-ritual-indigo px-6 py-3 font-semibold text-white transition-colors hover:bg-ritual-indigo-light"
            >
              Create the First Session
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeSessionsQuery.data?.sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-2xl bg-ritual-charcoal-light p-6 border-2 border-ritual-indigo hover:border-ritual-gold transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{session.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <UserCheck className="h-4 w-4" />
                      {session.currentParticipants} / {session.maxParticipants}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex gap-1 mb-2">
                    {session.participants.slice(0, 3).map((p, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          p.status === "focusing" ? "bg-ritual-aurora-green" :
                          p.status === "on_break" ? "bg-ritual-gold" :
                          "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {session.participants.filter(p => p.status === "focusing").length} focusing
                  </p>
                </div>

                <button
                  onClick={() => handleJoinSession(session.id)}
                  disabled={session.currentParticipants >= session.maxParticipants || joinSessionMutation.isPending}
                  className="w-full rounded-lg bg-ritual-gold px-4 py-2 font-semibold text-ritual-charcoal transition-all hover:scale-105 hover:bg-ritual-gold-light disabled:opacity-50 disabled:hover:scale-100"
                >
                  {session.currentParticipants >= session.maxParticipants ? "Full" : "Join Session"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-ritual-charcoal-light p-6">
            <h2 className="mb-4 font-rounded text-2xl font-bold text-white">
              Create New Session
            </h2>
            <div className="mb-6">
              <label htmlFor="sessionName" className="mb-2 block font-semibold text-white">
                Session Name
              </label>
              <input
                id="sessionName"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full rounded-xl border border-ritual-indigo bg-ritual-charcoal px-4 py-3 text-white focus:border-ritual-gold focus:outline-none focus:ring-2 focus:ring-ritual-gold/20"
                placeholder="e.g., Morning Deep Work Session"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-xl border-2 border-ritual-indigo px-6 py-3 font-semibold text-white transition-colors hover:bg-ritual-indigo/20"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={createSessionMutation.isPending}
                className="flex-1 rounded-xl bg-ritual-gold px-6 py-3 font-semibold text-ritual-charcoal transition-all hover:scale-105 hover:bg-ritual-gold-light disabled:opacity-50"
              >
                {createSessionMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
