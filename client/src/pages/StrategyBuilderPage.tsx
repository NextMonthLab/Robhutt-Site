/**
 * StrategyBuilderPage
 *
 * Fix 3: Single sequential initialisation flow.
 *
 * Previously, three effects competed on mount for authenticated users:
 *   1. GET /api/strategy (fetched strategy with empty planData)
 *   2. POST /api/strategy/claim-guest (claimed guest data)
 *   3. NormanStrategyChat's conversation loader + auto-continue
 *
 * These ran in parallel, causing race conditions where GET could resolve
 * before claim-guest, setting an empty strategy and losing plan sections.
 *
 * This implementation uses a SINGLE sequential init effect:
 *   Step 1: If localStorage has guest data, claim it FIRST
 *   Step 2: THEN fetch the strategy (which now includes planData)
 *
 * No claimAttempted ref, no guest claim redirect guard, no parallel effects.
 */

import { useState, useEffect, useCallback } from "react";
import NormanStrategyChat from "@/components/strategy/NormanStrategyChat";
import PlanCanvas from "@/components/strategy/PlanCanvas";

const GUEST_STORAGE_KEY = "strategy_guest_session";

export type StrategyData = {
  id: number;
  userId: number;
  title: string;
  status: string;
  planData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  guide?: string;
  mode?: string;
};

export default function StrategyBuilderPage() {
  const params = new URLSearchParams(window.location.search);
  const guide = params.get("guide") ?? "norman";
  const mode = params.get("mode") ?? "business";
  const moduleRef = params.get("ref");

  // Determine if user is a guest (no auth cookie / session).
  // In production this would check an auth context; here we check a simple flag.
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [strategy, setStrategy] = useState<StrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSections, setActiveSections] = useState<Set<string>>(new Set());
  const [splashDone, setSplashDone] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/status", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsGuest(!data.authenticated);
        } else {
          setIsGuest(true);
        }
      } catch {
        setIsGuest(true);
      }
    })();
  }, []);

  /**
   * Fix 3: Single sequential init effect.
   *
   * Replaces three competing parallel effects:
   *   - Guest claim redirect guard
   *   - Fetch or create strategy
   *   - Claim-guest restore
   *
   * Flow:
   *   1. If guest → set blank strategy, done.
   *   2. If authenticated → claim guest data first (if any), THEN fetch strategy.
   */
  useEffect(() => {
    if (isGuest === null) return; // still checking auth

    if (isGuest) {
      setStrategy({
        id: 0,
        userId: 0,
        title: "My Strategy",
        status: "draft",
        planData: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guide,
        mode,
      });
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // Step 1: If we have guest data in localStorage, claim it FIRST
        const stored = localStorage.getItem(GUEST_STORAGE_KEY);
        if (stored) {
          try {
            const guestData = JSON.parse(stored);
            if (Date.now() - (guestData.savedAt || 0) < 24 * 60 * 60 * 1000) {
              if (guestData.messages?.length > 0) {
                setSplashDone(true);
              }
              await fetch("/api/strategy/claim-guest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  messages: guestData.messages || [],
                  planData: guestData.planData || {},
                }),
              });
              // Claim succeeded (or failed silently) — we fetch strategy below
            }
          } catch { /* silent */ }
          localStorage.removeItem(GUEST_STORAGE_KEY);
        }

        if (cancelled) return;

        // Step 2: NOW fetch the strategy (which includes planData from characterxFraming)
        const res = await fetch(
          `/api/strategy?guide=${encodeURIComponent(guide)}&mode=${encodeURIComponent(mode)}`,
          { credentials: "include" },
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          const strat: StrategyData = data.strategy ?? data;
          setStrategy(strat);
          if (strat.planData) {
            setActiveSections(new Set(Object.keys(strat.planData)));
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isGuest, guide, mode]);

  // Save guest data to localStorage for claim after signup
  const saveGuestData = useCallback(
    (messages: Array<{ role: string; content: string }>, planData: Record<string, unknown>) => {
      if (!isGuest) return;
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({ messages, planData, savedAt: Date.now() }),
      );
    },
    [isGuest],
  );

  // Handle plan updates from the chat
  const handlePlanUpdate = useCallback(
    (planData: Record<string, unknown>) => {
      setStrategy((prev) => {
        if (!prev) return prev;
        const merged = { ...prev.planData, ...planData };
        return { ...prev, planData: merged };
      });
      setActiveSections((prev) => {
        const next = new Set(prev);
        Object.keys(planData).forEach((k) => next.add(k));
        return next;
      });
    },
    [],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Loading your strategy session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Chat panel */}
      <div className="w-full lg:w-1/2 border-r border-gray-200">
        <NormanStrategyChat
          strategy={strategy}
          guide={guide}
          mode={mode}
          moduleRef={moduleRef}
          isGuest={isGuest ?? true}
          splashDone={splashDone}
          onSplashDone={() => setSplashDone(true)}
          onPlanUpdate={handlePlanUpdate}
          onSaveGuestData={saveGuestData}
        />
      </div>

      {/* Plan canvas panel */}
      <div className="w-full lg:w-1/2 bg-gray-50 overflow-y-auto">
        <PlanCanvas
          planData={strategy?.planData ?? {}}
          activeSections={activeSections}
          guide={guide}
          mode={mode}
        />
      </div>
    </div>
  );
}
