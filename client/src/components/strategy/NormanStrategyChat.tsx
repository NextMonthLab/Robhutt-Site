/**
 * NormanStrategyChat
 *
 * Fix 3b: No auto-continue message, no localStorage-based message restoration.
 *
 * Previously this component had three workarounds that are now removed:
 *
 *   1. wasRestoredRef — tracked whether messages came from localStorage.
 *      Removed: messages are always loaded from the API for authenticated
 *      users, or start empty for guests.
 *
 *   2. useState initializer reading localStorage — created a dual-source-of-
 *      truth problem where localStorage and API notes could diverge.
 *      Removed: messages always start as an empty array.
 *
 *   3. Auto-continue effect — fired a hidden message ("I just created my
 *      account...") after claim-guest, causing Norman to re-ask opening
 *      questions because the GET raced with claim-guest.
 *      Removed: the sequential init in StrategyBuilderPage ensures notes
 *      are in the DB before this component loads them.
 *
 * The conversation loader effect (fetches /api/strategy/notes) is the SINGLE
 * source of truth for chat history for authenticated users.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { StrategyData } from "@/pages/StrategyBuilderPage";

export type ChatMessage = {
  id?: number;
  role: "user" | "norman";
  content: string;
  createdAt?: string;
};

type NormanStrategyChatProps = {
  strategy: StrategyData | null;
  guide: string;
  mode: string;
  moduleRef: string | null;
  isGuest: boolean;
  splashDone: boolean;
  onSplashDone: () => void;
  onPlanUpdate: (planData: Record<string, unknown>) => void;
  onSaveGuestData: (
    messages: Array<{ role: string; content: string }>,
    planData: Record<string, unknown>,
  ) => void;
};

export default function NormanStrategyChat({
  strategy,
  guide,
  mode,
  moduleRef,
  isGuest,
  splashDone,
  onSplashDone,
  onPlanUpdate,
  onSaveGuestData,
}: NormanStrategyChatProps) {
  // Fix 3b: Messages always start empty — no localStorage read in initializer
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const guideName = guide === "nora" ? "Nora" : "Norman";

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Conversation loader — fetches notes from the API.
   *
   * This is the SINGLE source of truth for chat history for authenticated
   * users. For guests, messages stay in local state only and are persisted
   * to localStorage via onSaveGuestData.
   *
   * Fix 3b: No wasRestoredRef, no auto-continue effect. After the sequential
   * claim flow in StrategyBuilderPage, all claimed notes are already in the
   * DB when this effect runs.
   */
  useEffect(() => {
    if (isGuest || !strategy?.id) {
      setNotesLoaded(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/strategy/notes", { credentials: "include" });
        if (res.ok && !cancelled) {
          const data = await res.json();
          const notes: ChatMessage[] = (data.notes ?? []).map(
            (note: { id: number; role: string; content: string; createdAt: string }) => ({
              id: note.id,
              role: note.role as "user" | "norman",
              content: note.content,
              createdAt: note.createdAt,
            }),
          );
          setMessages(notes);
          if (notes.length > 0) {
            onSplashDone();
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setNotesLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isGuest, strategy?.id, onSplashDone]);

  // Send a message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || sending) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setSending(true);
      onSplashDone();

      if (isGuest) {
        // Guest mode: generate a local response and save to localStorage
        const guideResponse: ChatMessage = {
          role: "norman",
          content: getGuestResponse(guide, mode, text, messages.length),
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => {
          const updated = [...prev, guideResponse];
          // Save to localStorage for claim after signup
          onSaveGuestData(
            updated.map((m) => ({ role: m.role, content: m.content })),
            strategy?.planData ?? {},
          );
          return updated;
        });
        setSending(false);
        return;
      }

      // Authenticated: send to API
      try {
        const res = await fetch("/api/strategy/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: text.trim() }),
        });

        if (res.ok) {
          const data = await res.json();
          const guideMessage: ChatMessage = {
            id: data.note?.id,
            role: "norman",
            content: data.response,
            createdAt: data.note?.createdAt,
          };
          setMessages((prev) => [...prev, guideMessage]);

          // If the response included plan updates, propagate them
          if (data.strategy?.planData) {
            onPlanUpdate(data.strategy.planData);
          }
        }
      } catch {
        // Show error in chat
        setMessages((prev) => [
          ...prev,
          {
            role: "norman",
            content: "Sorry, I had trouble processing that. Could you try again?",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [sending, isGuest, guide, mode, messages.length, strategy?.planData, onSplashDone, onSaveGuestData, onPlanUpdate],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Show splash / intro if no messages yet
  if (!splashDone && messages.length === 0 && notesLoaded) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">
              Meet {guideName}
            </h2>
            <p className="text-gray-600 mb-6">
              {guide === "nora"
                ? "Your strategy guide for building something meaningful."
                : mode === "jobseeker" || mode === "personal"
                  ? "Your guide for career moves and personal positioning."
                  : "Your guide for building business momentum with a clear 90-day strategy."}
            </p>
            <button
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => {
                onSplashDone();
                // Show the guide's opening message
                const opening = getGuideOpening(guide, mode);
                setMessages([
                  {
                    role: "norman",
                    content: opening,
                    createdAt: new Date().toISOString(),
                  },
                ]);
              }}
            >
              Start Strategy Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-semibold text-lg">{guideName}</h3>
        <p className="text-sm text-gray-500">
          {mode === "jobseeker" ? "Career Strategy" : mode === "personal" ? "Personal Strategy" : "Business Strategy"}
          {moduleRef ? ` — ${moduleRef}` : ""}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id ?? `msg-${i}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.role !== "user" && (
                <p className="text-xs font-semibold text-gray-500 mb-1">{guideName}</p>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">{guideName}</p>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${guideName}...`}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            rows={1}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        {isGuest && (
          <p className="text-xs text-gray-400 mt-2">
            Sign up to save your strategy session and unlock all plan sections.
          </p>
        )}
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Local helpers for guest mode
// ---------------------------------------------------------------------------

function getGuideOpening(guide: string, mode: string): string {
  if (guide === "nora") {
    return "Hi! I'm Nora, your strategy guide. Let's build something meaningful together. Tell me about what you're working on.";
  }
  if (mode === "jobseeker" || mode === "personal") {
    return "Hey, I'm Norman. I help people figure out their next move \u2014 career pivots, job searches, personal positioning. What's on your mind?";
  }
  return "Hey, I'm Norman. I help business owners and founders build momentum with a clear 90-day strategy. What kind of business do you run?";
}

function getGuestResponse(guide: string, mode: string, message: string, messageCount: number): string {
  const guideName = guide === "nora" ? "Nora" : "Norman";

  if (messageCount <= 2) {
    return `That's a great starting point. Tell me more \u2014 what does success look like for you in the next 90 days? What would make you feel like you're making real progress?`;
  }

  if (messageCount <= 4) {
    return `I'm starting to see some clear patterns here. Before I map this out, let me ask: what's the biggest thing that's been holding you back from making progress on this?`;
  }

  return `This is really helpful context. I have enough to start building out your strategy sections. To save your progress and see the full plan, you'll want to create an account. Everything we've discussed will be preserved.`;
}
