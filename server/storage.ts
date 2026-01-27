import { type User, type InsertUser } from "@shared/schema";
import { randomBytes, randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private planners: Map<string, PlannerRecord>;

  constructor() {
    this.users = new Map();
    this.planners = new Map();
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
}

export const storage = new MemStorage();
