import { useEffect, useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { PlannerCta } from "@/components/PlannerCta";
import { Button } from "@/components/ui/button";
import { SCORECARD_URL } from "@/lib/constants";

type CompletionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string };

const STORAGE_KEY = "scorecardCompletionPayload";

export default function ScorecardComplete() {
  const [state, setState] = useState<CompletionState>({ status: "idle" });
  const [editUrl, setEditUrl] = useState<string | null>(null);

  const payload = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("payload");
    if (encoded) {
      try {
        const decoded = atob(encoded);
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    }
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!payload) {
      setState({
        status: "error",
        message: "We couldn't find your scorecard results. Please complete the Scorecard again.",
      });
      return;
    }

    window.sessionStorage.removeItem(STORAGE_KEY);
    setState({ status: "loading" });

    const createPlanner = async () => {
      try {
        const response = await fetch("/api/scorecard/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("We couldn't build your plan just yet. Please try again.");
        }

        const data = (await response.json()) as { editUrl?: string };
        if (!data.editUrl) {
          throw new Error("We couldn't load your planner link. Please try again.");
        }

        setEditUrl(data.editUrl);
        window.location.assign(data.editUrl);
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        });
      }
    };

    void createPlanner();
  }, [payload]);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <NavBar />
      <main className="relative z-10 pt-24">
        <Section className="pt-24 pb-20 md:pt-32 md:pb-24">
          <div className="space-y-10">
            <PlannerCta
              headline="Not another PDF. A proper plan."
              body="Built automatically from your Scorecard results."
              buttonLabel="See the 90-day planner"
              href={editUrl ?? SCORECARD_URL}
            />

            <div className="bg-card/40 border border-border/50 rounded-xl p-6">
              {state.status === "loading" && (
                <p className="text-lg text-foreground font-medium">Building your 90-day plan…</p>
              )}
              {state.status === "error" && (
                <div className="space-y-4">
                  <p className="text-lg text-foreground font-medium">{state.message}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <a href={SCORECARD_URL} target="_blank" rel="noopener noreferrer">
                        Retake the scorecard
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/method">Back to the method</a>
                    </Button>
                  </div>
                </div>
              )}
              {state.status === "idle" && (
                <p className="text-muted-foreground">
                  Preparing your handoff to the 90-day planner.
                </p>
              )}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
