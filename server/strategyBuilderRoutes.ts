/**
 * Strategy Builder Routes
 *
 * Implements the strategy session API with three structural fixes:
 *
 * Fix 1: API returns planData parsed from characterxFraming
 *   The strategies table stores plan data in the characterx_framing TEXT column
 *   as JSON. The client expects a planData object. All endpoints that return a
 *   strategy parse characterxFraming → planData so the PlanCanvas renders
 *   correctly.
 *
 * Fix 2: Notes always saved as JSON { role, content, planUpdate }
 *   Both the claim-guest flow and the authenticated chat route save notes in
 *   the same JSON format. The history builder parses JSON and falls back to
 *   plain text for legacy notes (backwards-compatible).
 */

import { Router, type Request, type Response } from "express";
import { storage } from "./storage";
import { log } from "./index";

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function logRouteError(route: string, error: unknown, req: Request) {
  const msg = error instanceof Error ? error.message : String(error);
  log(`[${route}] error: ${msg}`, "strategy");
}

/**
 * Fix 1 helper — parse characterxFraming into planData for the client.
 * Returns the strategy row augmented with a planData field.
 */
function withPlanData(strategy: Record<string, unknown>) {
  let planData: Record<string, unknown> = {};
  const framing = strategy.characterxFraming;
  if (typeof framing === "string" && framing.length > 0) {
    try {
      planData = JSON.parse(framing);
    } catch { /* silent — malformed JSON stays empty */ }
  }
  return { ...strategy, planData };
}

/**
 * Fix 2 helper — parse a note's content, handling both JSON-wrapped (new
 * format) and plain-text (legacy) notes.
 */
function parseNoteContent(note: { content: string; authorId: string | null }) {
  let content = note.content;
  let role: "user" | "norman" = note.authorId ? "user" : "norman";

  try {
    const parsed = JSON.parse(note.content);
    if (parsed.content) content = parsed.content;
    if (parsed.role === "norman") role = "norman";
    else if (parsed.role === "user") role = "user";
  } catch { /* legacy plain text — use as-is */ }

  return { role, content };
}

// ---------------------------------------------------------------------------
// Middleware — simple session-based auth check
// ---------------------------------------------------------------------------

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: () => void) {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// ---------------------------------------------------------------------------
// Helper — get or create strategy for a user
// ---------------------------------------------------------------------------

async function getOrCreateStrategy(userId: string, guide?: string, mode?: string) {
  let strategy = await storage.getStrategyByUserId(userId);
  if (!strategy) {
    strategy = await storage.createStrategy({ userId, guide, mode });
  }
  return strategy;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /api/strategy — Get current user's strategy (or create a blank one).
 *
 * Fix 1: Parses characterxFraming → planData so the client PlanCanvas renders
 * sections correctly instead of showing "0/12".
 */
router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const guide = typeof req.query.guide === "string" ? req.query.guide : undefined;
    const mode = typeof req.query.mode === "string" ? req.query.mode : undefined;
    const strategy = await getOrCreateStrategy(userId, guide, mode);

    // Fix 1: parse characterxFraming into planData for the client
    res.json(withPlanData(strategy as unknown as Record<string, unknown>));
  } catch (error) {
    logRouteError("strategyBuilder", error, req);
    res.status(500).json({ error: "Failed to get strategy" });
  }
});

/**
 * GET /api/strategy/visitor/:token — Public read-only access via visitor token.
 *
 * Fix 1: Same planData treatment as the authenticated endpoint.
 */
router.get("/visitor/:token", async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token);
    const strategy = await storage.getStrategyByVisitorToken(token);
    if (!strategy) {
      return res.status(404).json({ error: "Strategy not found" });
    }

    // Fix 1: parse characterxFraming into planData for the client
    res.json(withPlanData(strategy as unknown as Record<string, unknown>));
  } catch (error) {
    logRouteError("strategyBuilder", error, req);
    res.status(500).json({ error: "Failed to get strategy" });
  }
});

/**
 * GET /api/strategy/notes — Load conversation notes for the current strategy.
 */
router.get("/notes", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const strategy = await storage.getStrategyByUserId(userId);
    if (!strategy) {
      return res.json({ notes: [] });
    }

    const notes = await storage.getNotesForStrategy(strategy.id);
    const parsed = notes.map((note) => {
      const { role, content } = parseNoteContent(note);
      return {
        id: note.id,
        role,
        content,
        createdAt: note.createdAt.toISOString(),
      };
    });

    res.json({ notes: parsed });
  } catch (error) {
    logRouteError("strategyBuilder", error, req);
    res.status(500).json({ error: "Failed to load notes" });
  }
});

/**
 * POST /api/strategy/claim-guest — Claim guest session data after signup.
 *
 * Fix 1: Returns strategy with parsed planData.
 * Fix 2: Saves notes in JSON format { role, content, planUpdate }.
 *
 * The client sends:
 *   { messages: Array<{ role, content }>, planData: Record<string, any> }
 *
 * This endpoint:
 * 1. Gets or creates a strategy for the authenticated user
 * 2. Merges the guest planData into characterxFraming
 * 3. Saves each guest message as a plan_note in JSON format
 * 4. Returns the updated strategy with planData
 */
router.post("/claim-guest", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { messages, planData } = req.body as {
      messages?: Array<{ role: string; content: string }>;
      planData?: Record<string, unknown>;
    };

    const strategy = await getOrCreateStrategy(userId);

    // Merge guest planData into characterxFraming
    let existingPlanData: Record<string, unknown> = {};
    if (strategy.characterxFraming) {
      try {
        existingPlanData = JSON.parse(strategy.characterxFraming);
      } catch { /* silent */ }
    }

    const mergedPlanData = { ...existingPlanData, ...(planData ?? {}) };
    const updated = await storage.updateStrategy(strategy.id, {
      characterxFraming: JSON.stringify(mergedPlanData),
    });

    // Fix 2: Save each guest message as a JSON-formatted plan_note
    if (messages && Array.isArray(messages)) {
      for (const msg of messages) {
        await storage.createNote({
          strategyId: strategy.id,
          authorId: msg.role === "user" ? userId : null,
          authorEmail: "norman_chat",
          content: JSON.stringify({
            role: msg.role === "user" ? "user" : "norman",
            content: msg.content,
            planUpdate: null,
          }),
        });
      }
    }

    // Fix 1: Return strategy with parsed planData
    const result = updated ?? strategy;
    res.json(withPlanData(result as unknown as Record<string, unknown>));
  } catch (error) {
    logRouteError("strategyBuilder", error, req);
    res.status(500).json({ error: "Failed to claim guest data" });
  }
});

/**
 * POST /api/strategy/chat — Send a message in the strategy chat.
 *
 * Fix 2: Both user and guide messages are saved as JSON
 *   { role: "user"|"norman", content: string, planUpdate: object|null }
 *
 * The history builder parses JSON notes and falls back to authorId-based role
 * detection for legacy plain-text notes (backwards-compatible).
 */
router.post("/chat", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message } = req.body as { message: string };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    const strategy = await getOrCreateStrategy(userId);

    // Fix 2: Save the user's message as a JSON-formatted plan_note
    const userNote = await storage.createNote({
      strategyId: strategy.id,
      authorId: userId,
      authorEmail: "norman_chat",
      content: JSON.stringify({ role: "user", content: message }),
    });

    // Build conversation history from notes for the AI guide
    const existingNotes = await storage.getNotesForStrategy(strategy.id);

    // Parse strategy context from characterxFraming
    let strategyContext: Record<string, unknown> = {};
    if (strategy.characterxFraming) {
      try {
        strategyContext = JSON.parse(strategy.characterxFraming);
      } catch { /* silent */ }
    }

    const guideOpening = getGuideOpening(strategy.guide ?? "norman", strategy.mode ?? "business");

    // Fix 2: History builder parses JSON notes, falls back to plain text
    const chronological = existingNotes.filter((n) => n.id !== userNote.id);
    const conversationHistory = chronological.map((note) => {
      let content = note.content;
      let role: "user" | "assistant" = note.authorId ? "user" : "assistant";
      try {
        const parsed = JSON.parse(note.content);
        if (parsed.content) content = parsed.content;
        if (parsed.role === "norman") role = "assistant";
        else if (parsed.role === "user") role = "user";
      } catch { /* legacy plain text — use as-is */ }
      return { role, content };
    });

    // Build the system prompt with strategy context
    const systemPrompt = buildSystemPrompt(
      strategy.guide ?? "norman",
      strategy.mode ?? "business",
      strategyContext,
    );

    // For now, generate a contextual response without external API
    // In production, this would call the Anthropic API with the full history
    const guideResponse = generateGuideResponse(
      strategy.guide ?? "norman",
      strategy.mode ?? "business",
      message,
      strategyContext,
    );

    // Check if the guide's response contains plan updates
    const planUpdate = extractPlanUpdate(guideResponse, strategyContext);

    // If there's a plan update, persist it to characterxFraming
    if (planUpdate) {
      const updatedPlanData = { ...strategyContext, ...planUpdate };
      await storage.updateStrategy(strategy.id, {
        characterxFraming: JSON.stringify(updatedPlanData),
      });
    }

    // Fix 2: Save guide's response as a JSON-formatted plan_note
    const normanNote = await storage.createNote({
      strategyId: strategy.id,
      authorId: null,
      authorEmail: "norman_chat",
      content: JSON.stringify({
        role: "norman",
        content: guideResponse,
        planUpdate: planUpdate ?? null,
      }),
    });

    // Return the response with the updated strategy
    const updatedStrategy = await storage.getStrategyByUserId(userId);

    res.json({
      response: guideResponse,
      note: {
        id: normanNote.id,
        role: "norman",
        content: guideResponse,
        planUpdate: planUpdate ?? null,
        createdAt: normanNote.createdAt.toISOString(),
      },
      strategy: updatedStrategy
        ? withPlanData(updatedStrategy as unknown as Record<string, unknown>)
        : undefined,
    });
  } catch (error) {
    logRouteError("strategyBuilder", error, req);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

/**
 * POST /api/strategy/update-plan — Direct plan data update (e.g. from PlanCanvas edits).
 */
router.post("/update-plan", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planData } = req.body as { planData: Record<string, unknown> };

    if (!planData || typeof planData !== "object") {
      return res.status(400).json({ error: "planData is required" });
    }

    const strategy = await getOrCreateStrategy(userId);

    let existingPlanData: Record<string, unknown> = {};
    if (strategy.characterxFraming) {
      try {
        existingPlanData = JSON.parse(strategy.characterxFraming);
      } catch { /* silent */ }
    }

    const merged = { ...existingPlanData, ...planData };
    const updated = await storage.updateStrategy(strategy.id, {
      characterxFraming: JSON.stringify(merged),
    });

    const result = updated ?? strategy;
    res.json(withPlanData(result as unknown as Record<string, unknown>));
  } catch (error) {
    logRouteError("strategyBuilder", error, req);
    res.status(500).json({ error: "Failed to update plan" });
  }
});

// ---------------------------------------------------------------------------
// Guide logic helpers
// ---------------------------------------------------------------------------

function getGuideOpening(guide: string, mode: string): string {
  if (guide === "nora") {
    return "Hi! I'm Nora, your strategy guide. Let's build something meaningful together. Tell me about what you're working on.";
  }

  if (mode === "jobseeker" || mode === "personal") {
    return "Hey, I'm Norman. I help people figure out their next move — career pivots, job searches, personal positioning. What's on your mind?";
  }

  return "Hey, I'm Norman. I help business owners and founders build momentum with a clear 90-day strategy. What kind of business do you run?";
}

function buildSystemPrompt(
  guide: string,
  mode: string,
  strategyContext: Record<string, unknown>,
): string {
  const guideName = guide === "nora" ? "Nora" : "Norman";
  const contextStr = Object.keys(strategyContext).length > 0
    ? `\n\nCurrent strategy context:\n${JSON.stringify(strategyContext, null, 2)}`
    : "";

  return `You are ${guideName}, a strategy guide helping users build actionable plans. You are warm, direct, and focused on practical outcomes. You ask clarifying questions to understand the user's situation before making recommendations.

Mode: ${mode}
${contextStr}

Important: If you already have context about the user's situation from previous messages, continue the conversation naturally. Do NOT re-introduce yourself or re-ask opening questions.`;
}

function generateGuideResponse(
  guide: string,
  mode: string,
  message: string,
  strategyContext: Record<string, unknown>,
): string {
  const guideName = guide === "nora" ? "Nora" : "Norman";
  const hasContext = Object.keys(strategyContext).length > 0;

  if (hasContext) {
    return `Thanks for sharing that. Based on what we've discussed so far, I can see some clear patterns forming. Let me think about how this fits into your overall strategy and what concrete steps make sense next.`;
  }

  return `Got it — that gives me a good starting point. Tell me more about what success looks like for you in the next 90 days. What would make you feel like you're making real progress?`;
}

function extractPlanUpdate(
  response: string,
  currentContext: Record<string, unknown>,
): Record<string, unknown> | null {
  // In production, this would parse structured plan updates from the AI response.
  // For now, return null (no automatic plan updates from the stub response).
  return null;
}

export default router;
