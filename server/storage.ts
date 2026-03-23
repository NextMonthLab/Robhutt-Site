import { type User, type InsertUser, type Strategy, type PlanNote } from "@shared/schema";
import { randomBytes, randomUUID } from "crypto";

export type StrategyRecord = {
  id: number;
  userId: string;
  title: string;
  status: string;
  characterxFraming: string | null;
  visitorToken: string | null;
  guide: string | null;
  mode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PlanNoteRecord = {
  id: number;
  strategyId: number;
  authorId: string | null;
  authorEmail: string | null;
  content: string;
  createdAt: Date;
};

export type ScorecardInsights = {
  primaryGoal: string;
  topPriorities: string[];
  keyBlockers: string[];
  strengths: string[];
  gaps: string[];
  recommendedFocus: string;
  confidenceScore: number;
};

export type PlannerPlan = {
  outcome: string;
  milestones: Array<{ day: number; description: string }>;
  weeklyActions: Array<{ week: number; focus: string; action: string }>;
  metrics: string[];
  reflectionPrompts: string[];
};

export type PlannerRecord = {
  plannerId: string;
  editToken: string;
  createdAt: string;
  source: string;
  scorecardId: string;
  completedAt: string;
  rawInsights: ScorecardInsights;
  plan: PlannerPlan;
  emailRequests: Array<{ email: string; requestedAt: string }>;
};

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPlanner(record: Omit<PlannerRecord, "plannerId" | "editToken" | "emailRequests">): Promise<PlannerRecord>;
  getPlanner(plannerId: string): Promise<PlannerRecord | undefined>;
  addPlannerEmailRequest(plannerId: string, email: string): Promise<PlannerRecord | undefined>;
  getStrategyByUserId(userId: string): Promise<StrategyRecord | undefined>;
  getStrategyByVisitorToken(token: string): Promise<StrategyRecord | undefined>;
  createStrategy(data: { userId: string; title?: string; guide?: string; mode?: string }): Promise<StrategyRecord>;
  updateStrategy(id: number, data: Partial<Pick<StrategyRecord, "characterxFraming" | "title" | "status" | "visitorToken">>): Promise<StrategyRecord | undefined>;
  getNotesForStrategy(strategyId: number): Promise<PlanNoteRecord[]>;
  createNote(data: { strategyId: number; authorId: string | null; authorEmail: string | null; content: string }): Promise<PlanNoteRecord>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private planners: Map<string, PlannerRecord>;
  private strategiesById: Map<number, StrategyRecord>;
  private strategiesByUser: Map<string, number>;
  private strategiesByToken: Map<string, number>;
  private notes: Map<number, PlanNoteRecord[]>;
  private nextStrategyId: number;
  private nextNoteId: number;

  constructor() {
    this.users = new Map();
    this.planners = new Map();
    this.strategiesById = new Map();
    this.strategiesByUser = new Map();
    this.strategiesByToken = new Map();
    this.notes = new Map();
    this.nextStrategyId = 1;
    this.nextNoteId = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPlanner(
    record: Omit<PlannerRecord, "plannerId" | "editToken" | "emailRequests">,
  ): Promise<PlannerRecord> {
    const plannerId = randomUUID();
    const editToken = randomBytes(32).toString("hex");
    const planner: PlannerRecord = {
      ...record,
      plannerId,
      editToken,
      emailRequests: [],
    };
    this.planners.set(plannerId, planner);
    return planner;
  }

  async getPlanner(plannerId: string): Promise<PlannerRecord | undefined> {
    return this.planners.get(plannerId);
  }

  async addPlannerEmailRequest(plannerId: string, email: string): Promise<PlannerRecord | undefined> {
    const planner = this.planners.get(plannerId);
    if (!planner) {
      return undefined;
    }
    planner.emailRequests.push({ email, requestedAt: new Date().toISOString() });
    this.planners.set(plannerId, planner);
    return planner;
  }

  async getStrategyByUserId(userId: string): Promise<StrategyRecord | undefined> {
    const id = this.strategiesByUser.get(userId);
    if (id === undefined) return undefined;
    return this.strategiesById.get(id);
  }

  async getStrategyByVisitorToken(token: string): Promise<StrategyRecord | undefined> {
    const id = this.strategiesByToken.get(token);
    if (id === undefined) return undefined;
    return this.strategiesById.get(id);
  }

  async createStrategy(data: { userId: string; title?: string; guide?: string; mode?: string }): Promise<StrategyRecord> {
    const id = this.nextStrategyId++;
    const now = new Date();
    const record: StrategyRecord = {
      id,
      userId: data.userId,
      title: data.title ?? "My Strategy",
      status: "draft",
      characterxFraming: null,
      visitorToken: null,
      guide: data.guide ?? "norman",
      mode: data.mode ?? "business",
      createdAt: now,
      updatedAt: now,
    };
    this.strategiesById.set(id, record);
    this.strategiesByUser.set(data.userId, id);
    return record;
  }

  async updateStrategy(id: number, data: Partial<Pick<StrategyRecord, "characterxFraming" | "title" | "status" | "visitorToken">>): Promise<StrategyRecord | undefined> {
    const record = this.strategiesById.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...data, updatedAt: new Date() };
    this.strategiesById.set(id, updated);
    if (data.visitorToken) {
      this.strategiesByToken.set(data.visitorToken, id);
    }
    return updated;
  }

  async getNotesForStrategy(strategyId: number): Promise<PlanNoteRecord[]> {
    return this.notes.get(strategyId) ?? [];
  }

  async createNote(data: { strategyId: number; authorId: string | null; authorEmail: string | null; content: string }): Promise<PlanNoteRecord> {
    const id = this.nextNoteId++;
    const record: PlanNoteRecord = {
      id,
      strategyId: data.strategyId,
      authorId: data.authorId,
      authorEmail: data.authorEmail,
      content: data.content,
      createdAt: new Date(),
    };
    const existing = this.notes.get(data.strategyId) ?? [];
    existing.push(record);
    this.notes.set(data.strategyId, existing);
    return record;
  }
}

export const storage = new MemStorage();
