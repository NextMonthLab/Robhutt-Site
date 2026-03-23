import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Shield,
  BookOpen,
  Cog,
  Send,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Scorecard data
// ---------------------------------------------------------------------------

interface Pillar {
  id: string;
  name: string;
  color: string;
  icon: React.ElementType;
  description: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  pillarId: string;
}

interface LikertOption {
  value: number;
  label: string;
}

const LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const PILLARS: Pillar[] = [
  {
    id: "character",
    name: "CHARACTER",
    color: "#8B5CF6",
    icon: Shield,
    description:
      "Your identity, values, and positioning. How clearly defined and consistently expressed is the core of who you are?",
    questions: [
      { id: "char-1", text: "I have a clearly defined personal or brand identity that guides my decisions.", pillarId: "character" },
      { id: "char-2", text: "My values are well-articulated and consistently reflected in my actions.", pillarId: "character" },
      { id: "char-3", text: "I can describe my unique positioning in one sentence.", pillarId: "character" },
      { id: "char-4", text: "People who interact with me get a consistent experience of who I am.", pillarId: "character" },
      { id: "char-5", text: "I regularly audit whether my actions align with my stated values.", pillarId: "character" },
    ],
  },
  {
    id: "story",
    name: "STORY",
    color: "#EC4899",
    icon: BookOpen,
    description:
      "Your narrative, messaging, and content. How compelling and coherent is the story you tell the world?",
    questions: [
      { id: "story-1", text: "I have a clear narrative arc that connects my past, present, and future.", pillarId: "story" },
      { id: "story-2", text: "My messaging resonates with and attracts the right audience.", pillarId: "story" },
      { id: "story-3", text: "I consistently create content that reinforces my core story.", pillarId: "story" },
      { id: "story-4", text: "My audience can articulate what I stand for without prompting.", pillarId: "story" },
      { id: "story-5", text: "I have a content strategy that builds on itself over time.", pillarId: "story" },
    ],
  },
  {
    id: "system",
    name: "SYSTEM",
    color: "#14B8A6",
    icon: Cog,
    description:
      "Your processes, habits, and infrastructure. How reliable and scalable are the systems that support your goals?",
    questions: [
      { id: "sys-1", text: "I have repeatable processes for my most important work.", pillarId: "system" },
      { id: "sys-2", text: "My daily habits directly support my long-term goals.", pillarId: "system" },
      { id: "sys-3", text: "I have systems in place that would keep things running if I took a week off.", pillarId: "system" },
      { id: "sys-4", text: "I regularly review and improve my workflows.", pillarId: "system" },
      { id: "sys-5", text: "My infrastructure (tools, automations, team) scales with my ambitions.", pillarId: "system" },
    ],
  },
];

const TOTAL_QUESTIONS = PILLARS.reduce((sum, p) => sum + p.questions.length, 0);

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

type Severity = "critical" | "warning" | "stable";

interface SeverityConfig {
  label: string;
  color: string;
  icon: React.ElementType;
  description: string;
}

const SEVERITY_MAP: Record<Severity, SeverityConfig> = {
  critical: {
    label: "Needs Attention",
    color: "var(--nm-error)",
    icon: AlertCircle,
    description: "This area needs significant work. Focus here first.",
  },
  warning: {
    label: "Room to Grow",
    color: "var(--nm-warning)",
    icon: AlertTriangle,
    description: "You have a foundation but there are clear gaps to address.",
  },
  stable: {
    label: "Strong Foundation",
    color: "var(--nm-success)",
    icon: ThumbsUp,
    description: "This area is well-developed. Maintain and refine.",
  },
};

function getSeverity(score: number, maxScore: number): Severity {
  const pct = (score / maxScore) * 100;
  if (pct < 40) return "critical";
  if (pct < 70) return "warning";
  return "stable";
}

// ---------------------------------------------------------------------------
// Page states
// ---------------------------------------------------------------------------

type PageState = "landing" | "questionnaire" | "results";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PublicScorecardPage() {
  const [pageState, setPageState] = useState<PageState>("landing");
  const [currentPillarIndex, setCurrentPillarIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Derived data
  const currentPillar = PILLARS[currentPillarIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPct = (answeredCount / TOTAL_QUESTIONS) * 100;

  const allCurrentAnswered = currentPillar.questions.every(
    (q) => answers[q.id] !== undefined,
  );

  const pillarResults = useMemo(() => {
    return PILLARS.map((pillar) => {
      const maxScore = pillar.questions.length * 5;
      const score = pillar.questions.reduce(
        (sum, q) => sum + (answers[q.id] || 0),
        0,
      );
      const severity = getSeverity(score, maxScore);
      return { pillar, score, maxScore, severity };
    });
  }, [answers]);

  const overallScore = useMemo(() => {
    const total = pillarResults.reduce((s, r) => s + r.score, 0);
    const max = pillarResults.reduce((s, r) => s + r.maxScore, 0);
    return { total, max, pct: Math.round((total / max) * 100) };
  }, [pillarResults]);

  const handleAnswer = useCallback(
    (questionId: string, value: number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    [],
  );

  const handleNext = useCallback(() => {
    if (currentPillarIndex < PILLARS.length - 1) {
      setCurrentPillarIndex((i) => i + 1);
    } else {
      setPageState("results");
    }
  }, [currentPillarIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentPillarIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) return;
      // In production this would call an API endpoint
      setEmailSubmitted(true);
    },
    [email],
  );

  // -------------------------------------------------------------------------
  // Landing page
  // -------------------------------------------------------------------------

  if (pageState === "landing") {
    return (
      <div
        className="min-h-screen"
        data-module="scorecards"
        style={{
          fontFamily: "var(--nm-font-body)",
          background: "var(--nm-bg)",
          color: "var(--nm-text)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge
              className="mb-4 border"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent-text)",
                borderColor: "var(--accent)",
              }}
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              CharacterX Scorecard
            </Badge>
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--nm-font-display)" }}
            >
              How Strong Is Your Foundation?
            </h1>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: "var(--nm-text-muted)" }}
            >
              Take the CharacterX Scorecard to assess your Character, Story, and
              System — the three pillars that drive sustainable growth.
            </p>
          </div>

          {/* Pillar overview cards */}
          <div className="mb-12">
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--nm-text-muted)" }}
            >
              What we'll assess
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    className="rounded-lg p-5 border"
                    style={{
                      background: "var(--nm-surface)",
                      borderColor: "var(--nm-border)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{
                          background: pillar.color + "20",
                          color: pillar.color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className="text-sm font-bold tracking-wider"
                        style={{ color: pillar.color }}
                      >
                        {pillar.name}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--nm-text-muted)" }}
                    >
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meta info */}
          <div
            className="rounded-lg p-4 mb-8 flex flex-wrap gap-6 text-sm"
            style={{
              background: "var(--nm-surface)",
              borderColor: "var(--nm-border)",
              color: "var(--nm-text-muted)",
            }}
          >
            <span>{TOTAL_QUESTIONS} questions</span>
            <span>~5 minutes</span>
            <span>Instant results</span>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              size="lg"
              className="text-white font-semibold px-8"
              style={{ background: "var(--accent)" }}
              onClick={() => setPageState("questionnaire")}
            >
              Start the Scorecard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Questionnaire
  // -------------------------------------------------------------------------

  if (pageState === "questionnaire") {
    return (
      <div
        className="min-h-screen"
        data-module="scorecards"
        style={{
          fontFamily: "var(--nm-font-body)",
          background: "var(--nm-bg)",
          color: "var(--nm-text)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--nm-text-muted)" }}
              >
                {answeredCount} of {TOTAL_QUESTIONS} answered
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--nm-text-dim)" }}
              >
                {Math.round(progressPct)}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "var(--nm-surface-2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
          </div>

          {/* Pillar tabs */}
          <div className="flex gap-2 mb-6">
            {PILLARS.map((pillar, i) => {
              const isActive = i === currentPillarIndex;
              const pillarAnswered = pillar.questions.every(
                (q) => answers[q.id] !== undefined,
              );
              return (
                <button
                  key={pillar.id}
                  onClick={() => setCurrentPillarIndex(i)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border"
                  style={{
                    background: isActive
                      ? pillar.color + "20"
                      : "var(--nm-surface)",
                    color: isActive ? pillar.color : "var(--nm-text-muted)",
                    borderColor: isActive
                      ? pillar.color + "40"
                      : "var(--nm-border)",
                  }}
                >
                  {pillarAnswered && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {pillar.name}
                </button>
              );
            })}
          </div>

          {/* Current pillar header */}
          <div key={currentPillarIndex} className="mb-8">
            <Badge
              className="mb-2 border"
              style={{
                background:
                  (currentPillar.color || "var(--accent)") + "20",
                color: currentPillar.color || "var(--accent-text)",
                borderColor:
                  (currentPillar.color || "var(--accent)") + "40",
              }}
            >
              {currentPillar.name}
            </Badge>
            <p
              className="text-sm"
              style={{ color: "var(--nm-text-muted)" }}
            >
              {currentPillar.description}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-6 mb-10">
            {currentPillar.questions.map((question, qi) => (
              <div
                key={question.id}
                className="rounded-lg p-5 border"
                style={{
                  background: "var(--nm-surface)",
                  borderColor: "var(--nm-border)",
                }}
              >
                <p className="text-sm font-medium mb-4" style={{ color: "var(--nm-text)" }}>
                  {qi + 1}. {question.text}
                </p>
                <div className="flex flex-wrap gap-2">
                  {LIKERT_OPTIONS.map((option) => {
                    const isSelected = answers[question.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleAnswer(question.id, option.value)
                        }
                        className="px-3 py-1.5 rounded-md text-xs font-medium transition-all border"
                        style={{
                          background: isSelected
                            ? "var(--accent)"
                            : "var(--nm-surface-2)",
                          color: isSelected
                            ? "#FFFFFF"
                            : "var(--nm-text-muted)",
                          borderColor: isSelected
                            ? "var(--accent)"
                            : "var(--nm-border)",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentPillarIndex === 0}
              className="disabled:opacity-50"
              style={{
                color:
                  currentPillarIndex === 0
                    ? "var(--nm-text-dim)"
                    : "var(--nm-text-muted)",
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentPillarIndex < PILLARS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!allCurrentAnswered}
                className="text-white font-semibold disabled:opacity-50"
                style={{ background: "var(--accent)" }}
              >
                Next: {PILLARS[currentPillarIndex + 1].name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!allCurrentAnswered}
                className="text-white font-semibold disabled:opacity-50"
                style={{ background: "var(--nm-success)" }}
              >
                <Send className="w-4 h-4 mr-2" />
                See Results
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Results
  // -------------------------------------------------------------------------

  return (
    <div
      className="min-h-screen"
      data-module="scorecards"
      style={{
        fontFamily: "var(--nm-font-body)",
        background: "var(--nm-bg)",
        color: "var(--nm-text)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        {/* Overall score */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-2"
            style={{ fontFamily: "var(--nm-font-display)" }}
          >
            Your Scorecard Results
          </h1>
          <p className="text-lg mb-6" style={{ color: "var(--nm-text-muted)" }}>
            Overall score:{" "}
            <span className="font-bold" style={{ color: "var(--accent-text)" }}>
              {overallScore.pct}%
            </span>{" "}
            ({overallScore.total}/{overallScore.max})
          </p>

          {/* Overall progress bar */}
          <div
            className="h-3 rounded-full overflow-hidden max-w-md mx-auto"
            style={{ background: "var(--nm-surface-2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallScore.pct}%`,
                background: "var(--accent)",
              }}
            />
          </div>
        </div>

        {/* Pillar results */}
        <div className="space-y-6 mb-12">
          {pillarResults.map(({ pillar, score, maxScore, severity }) => {
            const severityConfig = SEVERITY_MAP[severity];
            const SeverityIcon = severityConfig.icon;
            const pct = Math.round((score / maxScore) * 100);

            return (
              <div
                key={pillar.id}
                className="rounded-lg p-6 border"
                style={{
                  background: "var(--nm-surface)",
                  borderColor: "var(--nm-border)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center"
                      style={{
                        background: pillar.color + "20",
                        color: pillar.color,
                      }}
                    >
                      <pillar.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className="font-bold tracking-wider text-sm"
                        style={{ color: pillar.color }}
                      >
                        {pillar.name}
                      </h3>
                      <span
                        className="text-xs"
                        style={{ color: "var(--nm-text-muted)" }}
                      >
                        {score}/{maxScore} ({pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Severity badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{
                      background: severityConfig.color + "18",
                      color: severityConfig.color,
                    }}
                  >
                    <SeverityIcon className="w-3 h-3" />
                    {severityConfig.label}
                  </div>
                </div>

                {/* Pillar progress bar */}
                <div
                  className="h-2 rounded-full overflow-hidden mb-3"
                  style={{ background: "var(--nm-surface-2)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pillar.color,
                    }}
                  />
                </div>

                <p
                  className="text-sm"
                  style={{ color: "var(--nm-text-muted)" }}
                >
                  {severityConfig.description}
                </p>

                {/* Individual question scores */}
                <div className="mt-4 space-y-2">
                  {pillar.questions.map((q, qi) => {
                    const val = answers[q.id] || 0;
                    return (
                      <div
                        key={q.id}
                        className="flex items-center justify-between text-xs gap-4"
                      >
                        <span
                          className="truncate flex-1"
                          style={{ color: "var(--nm-text-muted)" }}
                        >
                          {qi + 1}. {q.text}
                        </span>
                        <div className="flex gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <div
                              key={v}
                              className="w-2 h-2 rounded-full"
                              style={{
                                background:
                                  v <= val
                                    ? pillar.color
                                    : "var(--nm-surface-3)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Email capture */}
        <div
          className="rounded-lg p-6 border mb-8"
          style={{
            background: "var(--accent-dim)",
            borderColor: "var(--nm-border)",
          }}
        >
          {emailSubmitted ? (
            <div className="text-center py-4">
              <CheckCircle2
                className="w-8 h-8 mx-auto mb-2"
                style={{ color: "var(--nm-success)" }}
              />
              <p className="font-semibold" style={{ color: "var(--nm-text)" }}>
                We'll be in touch!
              </p>
              <p className="text-sm" style={{ color: "var(--nm-text-muted)" }}>
                Your results have been saved and we'll send your personalised
                plan to {email}.
              </p>
            </div>
          ) : (
            <>
              <h3
                className="font-bold text-lg mb-1"
                style={{ color: "var(--nm-text)" }}
              >
                Get your personalised 90-day plan
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--nm-text-muted)" }}
              >
                Enter your email and we'll build a custom action plan based on
                your scorecard results.
              </p>
              <form
                onSubmit={handleEmailSubmit}
                className="flex gap-2 flex-col sm:flex-row"
              >
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-md text-sm border outline-none focus:ring-1"
                  style={{
                    background: "var(--nm-surface)",
                    borderColor: "var(--nm-border)",
                    color: "var(--nm-text)",
                  }}
                  required
                />
                <Button
                  type="submit"
                  className="text-white font-semibold shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send My Plan
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Retake */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setAnswers({});
              setCurrentPillarIndex(0);
              setEmailSubmitted(false);
              setEmail("");
              setPageState("landing");
            }}
            style={{ color: "var(--nm-text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retake the Scorecard
          </Button>
        </div>
      </div>
    </div>
  );
}
