import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { storage, type PlannerPlan, type ScorecardInsights } from "./storage";
import strategyBuilderRoutes from "./strategyBuilderRoutes";

const scorecardInsightsSchema = z.object({
  primaryGoal: z.string().min(1),
  topPriorities: z.array(z.string().min(1)).min(1),
  keyBlockers: z.array(z.string().min(1)).default([]),
  strengths: z.array(z.string().min(1)).default([]),
  gaps: z.array(z.string().min(1)).default([]),
  recommendedFocus: z.string().min(1),
  confidenceScore: z.number().min(0).max(100),
});

const scorecardPayloadSchema = z.object({
  source: z.literal("robhutt-scorecard"),
  scorecardId: z.string().uuid(),
  completedAt: z.string().datetime(),
  insights: scorecardInsightsSchema,
});

type ScorecardPayload = z.infer<typeof scorecardPayloadSchema>;

const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMax = 60;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const getRequestIp = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip ?? "unknown";
};

const rateLimit = (req: Request) => {
  const ip = getRequestIp(req);
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
    return { limited: false };
  }

  if (entry.count >= rateLimitMax) {
    return { limited: true, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);
  return { limited: false };
};

const getRawBody = (req: Request): Buffer => {
  if (Buffer.isBuffer(req.rawBody)) {
    return req.rawBody;
  }
  if (typeof req.rawBody === "string") {
    return Buffer.from(req.rawBody);
  }
  return Buffer.from(JSON.stringify(req.body ?? {}));
};

const computeSignature = (secret: string, payload: Buffer | string) =>
  createHmac("sha256", secret).update(payload).digest("hex");

const hasValidSignature = (req: Request, secret: string) => {
  const signatureHeader = req.headers["x-signature"];
  if (typeof signatureHeader !== "string") {
    return false;
  }
  const payload = getRawBody(req);
  const expected = computeSignature(secret, payload);

  const expectedBuffer = Buffer.from(expected, "hex");
  let providedBuffer: Buffer;
  try {
    providedBuffer = Buffer.from(signatureHeader, "hex");
  } catch {
    return false;
  }

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
};

const derivePlannerPlan = (insights: ScorecardInsights): PlannerPlan => {
  const priorities = insights.topPriorities.length > 0
    ? insights.topPriorities
    : ["Clarify positioning", "Strengthen trust", "Ship consistently"];
  const blockers = insights.keyBlockers.length > 0
    ? insights.keyBlockers
    : ["Undefined constraints", "Inconsistent execution"];

  const outcome = insights.primaryGoal || insights.recommendedFocus;
  const milestones = [
    {
      day: 30,
      description: `Define the first momentum milestone around ${priorities[0]}.`,
    },
    {
      day: 60,
      description: `Build repeatable habits that reinforce ${priorities[1] ?? priorities[0]}.`,
    },
    {
      day: 90,
      description: `Deliver the full 90-day outcome: ${outcome}.`,
    },
  ];

  const weeklyActions = Array.from({ length: 12 }, (_, index) => {
    const focus = priorities[index % priorities.length];
    const blocker = blockers[index % blockers.length];
    return {
      week: index + 1,
      focus,
      action: `Ship one meaningful action on ${focus} while removing ${blocker}.`,
    };
  });

  const metrics = [
    `Confidence score baseline: ${insights.confidenceScore}/100`,
    "Weekly priority completion rate",
    "Milestone progress at days 30/60/90",
    "Momentum metric: planned vs delivered actions",
  ];

  const reflectionPrompts = [
    "What created the most momentum this week?",
    "What slowed progress and how will you remove it?",
    "Which strength did you lean on most?",
    "What needs to change before next week?",
  ];

  return {
    outcome,
    milestones,
    weeklyActions,
    metrics,
    reflectionPrompts,
  };
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Strategy builder routes
  app.use("/api/strategy", strategyBuilderRoutes);

  // Auth status check (used by StrategyBuilderPage to detect guest vs authenticated)
  app.get("/api/auth/status", (req, res) => {
    const user = (req as any).user;
    res.json({ authenticated: !!user?.id, user: user ? { id: user.id } : null });
  });

  app.post("/api/public/planner/from-scorecard", async (req, res) => {
    const rateLimitStatus = rateLimit(req);
    if (rateLimitStatus.limited) {
      if (rateLimitStatus.retryAfterMs) {
        res.setHeader("Retry-After", Math.ceil(rateLimitStatus.retryAfterMs / 1000));
      }
      return res.status(429).json({ message: "Too many requests. Try again later." });
    }

    const secret = process.env.SCORECARD_SHARED_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Scorecard secret is not configured." });
    }

    if (!hasValidSignature(req, secret)) {
      return res.status(401).json({ message: "Invalid signature." });
    }

    const parsed = scorecardPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid payload.", errors: parsed.error.flatten() });
    }

    const payload = parsed.data;
    const plan = derivePlannerPlan(payload.insights);
    const planner = await storage.createPlanner({
      createdAt: new Date().toISOString(),
      source: payload.source,
      scorecardId: payload.scorecardId,
      completedAt: payload.completedAt,
      rawInsights: payload.insights,
      plan,
    });

    const plannerBaseUrl = process.env.CHARACTERX_BASE_URL ?? "https://characterx.app";
    const editUrl = `${plannerBaseUrl}/planner/${planner.plannerId}?token=${planner.editToken}`;
    const viewUrl = `${plannerBaseUrl}/planner/${planner.plannerId}`;

    return res.status(201).json({ editUrl, viewUrl });
  });

  app.post("/api/public/planner/:plannerId/email-link", async (req, res) => {
    const plannerId = req.params.plannerId;
    const emailSchema = z.object({ email: z.string().email() });
    const parsed = emailSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const planner = await storage.addPlannerEmailRequest(plannerId, parsed.data.email);
    if (!planner) {
      return res.status(404).json({ message: "Planner not found." });
    }

    return res.status(202).json({ message: "Planner link queued for delivery." });
  });

  app.get("/api/public/planner/:plannerId", async (req, res) => {
    const plannerId = req.params.plannerId;
    const planner = await storage.getPlanner(plannerId);
    if (!planner) {
      return res.status(404).json({ message: "Planner not found." });
    }

    const token = typeof req.query.token === "string" ? req.query.token : undefined;
    const canEdit = token ? token === planner.editToken : false;

    return res.json({
      plannerId: planner.plannerId,
      createdAt: planner.createdAt,
      source: planner.source,
      scorecardId: planner.scorecardId,
      completedAt: planner.completedAt,
      insights: planner.rawInsights,
      plan: planner.plan,
      canEdit,
    });
  });

  app.post("/api/scorecard/complete", async (req, res) => {
    const secret = process.env.SCORECARD_SHARED_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Scorecard secret is not configured." });
    }

    const parsed = scorecardPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid payload.", errors: parsed.error.flatten() });
    }

    const payload = parsed.data as ScorecardPayload;
    const body = JSON.stringify(payload);
    const signature = computeSignature(secret, body);

    const characterxBaseUrl = process.env.CHARACTERX_API_BASE_URL ?? "https://characterx.app";
    const url = new URL("/api/public/planner/from-scorecard", characterxBaseUrl);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
      body,
    });

    if (!response.ok) {
      const message = await response.text();
      return res.status(502).json({
        message: "Failed to create planner.",
        details: message,
      });
    }

    const data = (await response.json()) as { editUrl?: string };

    if (!data.editUrl) {
      return res.status(502).json({ message: "Planner response missing editUrl." });
    }

    return res.json({ editUrl: data.editUrl });
  });

  return httpServer;
}
