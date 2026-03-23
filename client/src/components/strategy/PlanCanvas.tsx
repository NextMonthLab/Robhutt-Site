/**
 * PlanCanvas — displays the strategy plan sections.
 *
 * Reads from strategy.planData (which is parsed from characterxFraming
 * on the server — Fix 1). Previously, planData was always undefined because
 * the API returned the raw Drizzle row with characterxFraming as a string,
 * not a parsed planData object. This caused "0/12" sections.
 *
 * Now that GET /api/strategy returns planData correctly, this component
 * renders the actual populated sections.
 */

const PLAN_SECTIONS = [
  { key: "vision", label: "Vision & Purpose" },
  { key: "audience", label: "Target Audience" },
  { key: "positioning", label: "Positioning" },
  { key: "offer", label: "Core Offer" },
  { key: "messaging", label: "Key Messaging" },
  { key: "channels", label: "Channels & Distribution" },
  { key: "milestones_30", label: "30-Day Milestones" },
  { key: "milestones_60", label: "60-Day Milestones" },
  { key: "milestones_90", label: "90-Day Milestones" },
  { key: "blockers", label: "Blockers & Risks" },
  { key: "metrics", label: "Success Metrics" },
  { key: "weekly_actions", label: "Weekly Actions" },
] as const;

type PlanCanvasProps = {
  planData: Record<string, unknown>;
  activeSections: Set<string>;
  guide: string;
  mode: string;
};

export default function PlanCanvas({ planData, activeSections, guide, mode }: PlanCanvasProps) {
  const populatedCount = PLAN_SECTIONS.filter((s) => planData[s.key] != null).length;
  const totalSections = PLAN_SECTIONS.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Strategy Plan</h2>
        <p className="text-sm text-gray-500">
          {populatedCount}/{totalSections} sections populated
        </p>
        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gray-900 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(populatedCount / totalSections) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {PLAN_SECTIONS.map((section) => {
          const data = planData[section.key];
          const isActive = activeSections.has(section.key);
          const isPopulated = data != null;

          return (
            <div
              key={section.key}
              className={`rounded-lg border p-4 transition-all ${
                isPopulated
                  ? "border-gray-300 bg-white"
                  : isActive
                    ? "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{section.label}</h3>
                {isPopulated && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </div>
              {isPopulated ? (
                <div className="text-sm text-gray-700">
                  {typeof data === "string" ? (
                    <p>{data}</p>
                  ) : Array.isArray(data) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {(data as unknown[]).map((item, i) => (
                        <li key={i}>{String(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Continue chatting to populate this section
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
