import { useEffect, useMemo, useState, type FormEvent } from "react";
import { NavBar } from "@/components/NavBar";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PlannerResponse = {
  plannerId: string;
  createdAt: string;
  source: string;
  scorecardId: string;
  completedAt: string;
  insights: {
    primaryGoal: string;
    topPriorities: string[];
    keyBlockers: string[];
    strengths: string[];
    gaps: string[];
    recommendedFocus: string;
    confidenceScore: number;
  };
  plan: {
    outcome: string;
    milestones: Array<{ day: number; description: string }>;
    weeklyActions: Array<{ week: number; focus: string; action: string }>;
    metrics: string[];
    reflectionPrompts: string[];
  };
  canEdit: boolean;
};

type PlannerState =
  | { status: "loading" }
  | { status: "ready"; data: PlannerResponse }
  | { status: "error"; message: string };

export default function Planner({ params }: { params: { plannerId: string } }) {
  const { plannerId } = params;
  const [state, setState] = useState<PlannerState>({ status: "loading" });
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") ?? "";
  }, []);

  useEffect(() => {
    const loadPlanner = async () => {
      try {
        const query = token ? `?token=${encodeURIComponent(token)}` : "";
        const response = await fetch(`/api/public/planner/${plannerId}${query}`);
        if (!response.ok) {
          throw new Error("We couldn't load this planner. Please check your link.");
        }
        const data = (await response.json()) as PlannerResponse;
        setState({ status: "ready", data });
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    };

    void loadPlanner();
  }, [plannerId, token]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setEmailStatus("Link copied. Save it somewhere safe.");
      setTimeout(() => setEmailStatus(null), 3000);
    } catch {
      setEmailStatus("Unable to copy link automatically. Please copy the URL from your browser.");
    }
  };

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailStatus(null);
    try {
      const response = await fetch(`/api/public/planner/${plannerId}/email-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("We couldn't send your link. Please check the address and try again.");
      }
      setEmailStatus("Link queued. Check your inbox shortly.");
      setEmail("");
    } catch (error) {
      setEmailStatus(error instanceof Error ? error.message : "Unable to send email link.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <NavBar />
      <main className="relative z-10 pt-24">
        <Section className="pt-24 pb-16 md:pt-32">
          <div className="space-y-6">
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 flex flex-col gap-4">
              <div>
                <p className="text-sm text-foreground/80">This is a private link. Save it to return later.</p>
                <p className="text-xs text-muted-foreground">Keep this link somewhere safe. Anyone with it can access this planner.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={copyLink} type="button">
                  Copy link
                </Button>
              </div>
            </div>

            <Card className="bg-card/40 border-border/50">
              <CardHeader>
                <CardTitle>Email me my planner link</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col md:flex-row gap-3" onSubmit={submitEmail}>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                  <Button type="submit">Send link</Button>
                </form>
                {emailStatus && <p className="text-sm text-muted-foreground mt-3">{emailStatus}</p>}
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section className="border-t border-border/30 py-12">
          {state.status === "loading" && (
            <p className="text-lg text-muted-foreground">Loading your planner…</p>
          )}
          {state.status === "error" && (
            <p className="text-lg text-foreground font-medium">{state.message}</p>
          )}
          {state.status === "ready" && (
            <div className="space-y-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Your 90-day plan</h1>
                <p className="text-muted-foreground">Outcome: {state.data.plan.outcome}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {state.data.canEdit ? "Edit access enabled" : "View-only access"}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {state.data.plan.milestones.map((milestone) => (
                  <Card key={milestone.day} className="bg-card/30 border-border/50">
                    <CardHeader>
                      <CardTitle>{milestone.day}-day milestone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-card/30 border-border/50">
                <CardHeader>
                  <CardTitle>Weekly actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {state.data.plan.weeklyActions.map((action) => (
                      <div key={action.week} className="border border-border/40 rounded-lg p-4">
                        <p className="text-sm font-medium text-foreground">Week {action.week}: {action.focus}</p>
                        <p className="text-sm text-muted-foreground mt-2">{action.action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card/30 border-border/50">
                  <CardHeader>
                    <CardTitle>Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {state.data.plan.metrics.map((metric) => (
                        <li key={metric} className="flex gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-card/30 border-border/50">
                  <CardHeader>
                    <CardTitle>Reflection prompts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {state.data.plan.reflectionPrompts.map((prompt) => (
                        <li key={prompt} className="flex gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                          <span>{prompt}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </Section>
      </main>
      <Footer />
    </div>
  );
}
