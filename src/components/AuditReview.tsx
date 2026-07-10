import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock,
  FileText,
  Info,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type AuditFinding,
  type FindingSeverity,
  type FindingStatus,
  type TeamMember,
  auditMeta,
  mockAuditFindings,
  teamMembers,
} from "@/data/mock-audit";

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

const severityConfig: Record<
  FindingSeverity,
  {
    label: string;
    icon: React.ReactNode;
    badgeClass: string;
    borderClass: string;
    shimmerClass: string;
  }
> = {
  critical: {
    label: "Critical",
    icon: <XCircle className="size-3.5" />,
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    borderClass: "border-l-destructive",
    shimmerClass: "from-destructive/5 via-destructive/10 to-destructive/5",
  },
  major: {
    label: "Major",
    icon: <AlertTriangle className="size-3.5" />,
    badgeClass:
      "bg-fuego-500/10 text-fuego-700 border-fuego-500/30 dark:text-fuego-300",
    borderClass: "border-l-fuego-500",
    shimmerClass: "from-fuego-500/5 via-fuego-500/10 to-fuego-500/5",
  },
  minor: {
    label: "Minor",
    icon: <CircleAlert className="size-3.5" />,
    badgeClass: "bg-secondary text-secondary-foreground border-border",
    borderClass: "border-l-muted-foreground/40",
    shimmerClass: "from-muted via-accent to-muted",
  },
  info: {
    label: "Info",
    icon: <Info className="size-3.5" />,
    badgeClass: "bg-secondary text-muted-foreground border-border",
    borderClass: "border-l-border",
    shimmerClass: "from-muted via-accent to-muted",
  },
};

const statusConfig: Record<
  FindingStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  open: {
    label: "Awaiting response",
    icon: <Clock className="size-3" />,
    className: "text-muted-foreground",
  },
  responded: {
    label: "Responded",
    icon: <MessageSquare className="size-3" />,
    className: "text-fuego-600 dark:text-fuego-400",
  },
  resolved: {
    label: "Resolved",
    icon: <CheckCircle2 className="size-3" />,
    className: "text-green-600 dark:text-green-400",
  },
  dismissed: {
    label: "Dismissed",
    icon: <XCircle className="size-3" />,
    className: "text-muted-foreground line-through",
  },
};

// ---------------------------------------------------------------------------
// Shimmer — the "Just Need Your Input" visual treatment for unanswered items
// ---------------------------------------------------------------------------

function ShimmerPlaceholder({ severity }: { severity: FindingSeverity }) {
  const { shimmerClass } = severityConfig[severity];
  return (
    <div className="space-y-2 pt-1" aria-hidden="true">
      <div
        className={cn(
          "h-3 w-3/4 animate-pulse rounded-full bg-gradient-to-r opacity-60",
          shimmerClass,
        )}
      />
      <div
        className={cn(
          "h-3 w-1/2 animate-pulse rounded-full bg-gradient-to-r opacity-40",
          shimmerClass,
        )}
        style={{ animationDelay: "150ms" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------

function AuditStats({ findings }: { findings: AuditFinding[] }) {
  const blocking = findings.filter((f) => f.blocking && f.status === "open").length;
  const open = findings.filter((f) => f.status === "open").length;
  const responded = findings.filter((f) => f.status === "responded").length;
  const resolved = findings.filter((f) => f.status === "resolved").length;

  return (
    <div className="flex flex-wrap gap-6">
      <Stat
        value={findings.length}
        label="Total findings"
        valueClass="text-foreground"
      />
      <Stat
        value={blocking}
        label="Blocking sign-off"
        valueClass="text-destructive"
      />
      <Stat
        value={open}
        label="Awaiting response"
        valueClass="text-fuego-600 dark:text-fuego-400"
      />
      <Stat
        value={responded}
        label="Responded"
        valueClass="text-foreground"
      />
      <Stat
        value={resolved}
        label="Resolved"
        valueClass="text-green-600 dark:text-green-400"
      />
    </div>
  );
}

function Stat({
  value,
  label,
  valueClass,
}: {
  value: number;
  label: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={cn("text-2xl font-bold tabular-nums", valueClass)}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Member avatar
// ---------------------------------------------------------------------------

function MemberAvatar({ member, size = "sm" }: { member: TeamMember; size?: "sm" | "md" }) {
  return (
    <span
      title={`${member.name} · ${member.role}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        member.color,
        size === "sm" ? "size-5 text-[10px]" : "size-7 text-xs",
      )}
      aria-label={member.name}
    >
      {member.initials}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Team workload panel
// ---------------------------------------------------------------------------

function TeamWorkload({
  findings,
  activeId,
  onSelect,
}: {
  findings: AuditFinding[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Team workload
        </span>
        {activeId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        {teamMembers.map((member) => {
          const mine = findings.filter((f) => f.assignedTo === member.id);
          const open = mine.filter((f) => f.status === "open").length;
          const done = mine.filter((f) => f.status === "responded" || f.status === "resolved").length;
          const pct = mine.length === 0 ? 0 : Math.round((done / mine.length) * 100);
          const isActive = activeId === member.id;

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelect(isActive ? null : member.id)}
              aria-pressed={isActive}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent/50",
              )}
            >
              <MemberAvatar member={member} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <span className="truncate text-sm font-medium text-foreground">{member.name}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">{member.role}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {open} open · {done} done
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        pct === 100 ? "bg-green-500" : "bg-fuego-500",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                    {pct}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Response input
// ---------------------------------------------------------------------------

function ResponseInput({
  findingId,
  onSubmit,
}: {
  findingId: string;
  onSubmit: (id: string, response: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(findingId, trimmed);
    setValue("");
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Your response
      </p>
      <div className="rounded-lg border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 transition-[color,box-shadow]">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Provide supporting documentation, clarification, or correction…"
          className="min-h-[80px] resize-none rounded-b-none border-0 shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between border-t border-input px-3 py-2">
          <span className="text-[11px] text-muted-foreground">
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5 text-[10px]">
              ⌘
            </kbd>{" "}
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5 text-[10px]">
              Enter
            </kbd>{" "}
            to send
          </span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="bg-thermal gap-1.5 text-white shadow-sm hover:brightness-105 disabled:opacity-40"
          >
            <Send className="size-3.5" />
            Send response
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single finding card
// ---------------------------------------------------------------------------

function FindingCard({
  finding,
  onRespond,
}: {
  finding: AuditFinding;
  onRespond: (id: string, response: string) => void;
}) {
  const [expanded, setExpanded] = useState(
    finding.status === "open" && finding.blocking,
  );
  const sev = severityConfig[finding.severity];
  const stat = statusConfig[finding.status];
  const needsInput = finding.status === "open";
  const assignee = teamMembers.find((m) => m.id === finding.assignedTo);

  return (
    <article
      className={cn(
        "rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        "border-l-4",
        sev.borderClass,
        needsInput && finding.blocking && "ring-1 ring-destructive/20",
      )}
      aria-label={`Finding ${finding.ref}: ${finding.lineItem}`}
    >
      {/* Card header — always visible */}
      <button
        type="button"
        className="flex w-full items-start gap-3 px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Severity icon */}
        <span
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
            sev.badgeClass,
          )}
          aria-label={sev.label}
        >
          {sev.icon}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          {/* Top row — ref, severity, blocking flag, status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {finding.ref}
            </span>
            <Badge
              variant="outline"
              className={cn("rounded-full text-[10px]", sev.badgeClass)}
            >
              {sev.icon}
              {sev.label}
            </Badge>
            {finding.blocking && finding.status === "open" && (
              <Badge
                variant="destructive"
                className="rounded-full text-[10px]"
              >
                Blocking sign-off
              </Badge>
            )}
            <span
              className={cn(
                "ml-auto flex shrink-0 items-center gap-1 text-xs",
                stat.className,
              )}
            >
              {stat.icon}
              {stat.label}
            </span>
          </div>

          {/* Line item */}
          <p className="text-sm font-medium leading-snug text-foreground">
            {finding.lineItem}
          </p>

          {/* Category + auditor + assignee */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="size-3" />
              {finding.category}
            </span>
            <span>Flagged by {finding.auditorName}</span>
            <span>{new Date(finding.auditedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            {assignee && (
              <span className="ml-auto flex items-center gap-1.5">
                <MemberAvatar member={assignee} size="sm" />
                {assignee.name}
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <span className="mt-0.5 shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
          {/* Auditor note */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Auditor&rsquo;s finding
            </p>
            <div
              className={cn(
                "rounded-lg px-4 py-3 text-sm leading-relaxed",
                finding.severity === "critical"
                  ? "bg-destructive/[0.06] text-foreground"
                  : finding.severity === "major"
                    ? "bg-fuego-500/[0.06] text-foreground"
                    : "bg-muted text-foreground",
              )}
            >
              <p>{finding.auditorNote}</p>
            </div>
          </div>

          {/* Recommended action */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended action
            </p>
            <div className="flex gap-3 rounded-lg border border-fuego-200 bg-fuego-50 px-4 py-3 text-sm leading-relaxed dark:border-fuego-900 dark:bg-fuego-900/20">
              <span className="mt-0.5 shrink-0 text-fuego-500">
                <CheckCircle2 className="size-4" />
              </span>
              <p className="text-fuego-900 dark:text-fuego-100">{finding.recommendedAction}</p>
            </div>
          </div>

          {/* Client response area */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Client response
            </p>

            {finding.clientResponse ? (
              /* Responded — show the text with a subtle settled treatment */
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground">
                <p>{finding.clientResponse}</p>
                {finding.respondedAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted{" "}
                    {new Date(finding.respondedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            ) : (
              /* Open — shimmer + input, fuego-tinted "just need your input" */
              <div className="rounded-lg border border-dashed border-fuego-300/60 bg-fuego-50/50 px-4 py-3 dark:border-fuego-800/40 dark:bg-fuego-900/10">
                <p className="text-xs italic text-fuego-600/70 dark:text-fuego-400/70">
                  Just need your input…
                </p>
                <ShimmerPlaceholder severity={finding.severity} />
              </div>
            )}

            {needsInput && (
              <ResponseInput findingId={finding.id} onSubmit={onRespond} />
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Status filter bar
// ---------------------------------------------------------------------------

type FilterStatus = "all" | FindingStatus;

const statusFilterOptions: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Awaiting" },
  { value: "responded", label: "Responded" },
  { value: "resolved", label: "Resolved" },
];

function FilterBar({
  active,
  onChange,
  counts,
}: {
  active: FilterStatus;
  onChange: (v: FilterStatus) => void;
  counts: Record<FilterStatus, number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter findings by status"
      className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-1"
    >
      {statusFilterOptions.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={active === value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            active === value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
          <span
            className={cn(
              "flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums font-semibold",
              active === value ? "bg-primary text-primary-foreground" : "bg-border",
            )}
          >
            {counts[value]}
          </span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Severity filter pills
// ---------------------------------------------------------------------------

type FilterSeverity = "all" | FindingSeverity;

const severityFilterOptions: {
  value: FilterSeverity;
  label: string;
  activeClass: string;
  dotClass: string;
}[] = [
  {
    value: "all",
    label: "All levels",
    activeClass: "bg-foreground text-background",
    dotClass: "",
  },
  {
    value: "critical",
    label: "Critical",
    activeClass: "bg-destructive text-white",
    dotClass: "bg-destructive",
  },
  {
    value: "major",
    label: "Major",
    activeClass: "bg-fuego-500 text-white",
    dotClass: "bg-fuego-500",
  },
  {
    value: "minor",
    label: "Minor",
    activeClass: "bg-foreground text-background",
    dotClass: "bg-muted-foreground",
  },
  {
    value: "info",
    label: "Info",
    activeClass: "bg-foreground text-background",
    dotClass: "bg-border",
  },
];

function SeverityFilterPills({
  active,
  onChange,
  counts,
}: {
  active: FilterSeverity;
  onChange: (v: FilterSeverity) => void;
  counts: Record<FilterSeverity, number>;
}) {
  return (
    <div
      role="group"
      aria-label="Filter findings by severity"
      className="flex flex-wrap items-center gap-1.5"
    >
      {severityFilterOptions.map(({ value, label, activeClass, dotClass }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              isActive
                ? cn("border-transparent", activeClass)
                : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {value !== "all" && (
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isActive ? "bg-current opacity-70" : dotClass,
                )}
              />
            )}
            {label}
            <span
              className={cn(
                "tabular-nums",
                isActive ? "opacity-70" : "text-muted-foreground",
              )}
            >
              {counts[value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AuditReview component
// ---------------------------------------------------------------------------

export function AuditReview() {
  const [findings, setFindings] = useState<AuditFinding[]>(mockAuditFindings);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>("all");
  const [memberFilter, setMemberFilter] = useState<string | null>(null);

  function handleRespond(id: string, response: string) {
    setFindings((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              clientResponse: response,
              respondedAt: new Date().toISOString().split("T")[0],
              status: "responded" as const,
            }
          : f,
      ),
    );
  }

  // Status counts always reflect the full set so tabs don't shift as you
  // toggle severity.
  const statusCounts: Record<FilterStatus, number> = {
    all: findings.length,
    open: findings.filter((f) => f.status === "open").length,
    responded: findings.filter((f) => f.status === "responded").length,
    resolved: findings.filter((f) => f.status === "resolved").length,
    dismissed: findings.filter((f) => f.status === "dismissed").length,
  };

  // Apply status filter first, then count by severity so the pill numbers
  // reflect what's in the current status tab.
  const afterStatusFilter =
    statusFilter === "all"
      ? findings
      : findings.filter((f) => f.status === statusFilter);

  const severityCounts: Record<FilterSeverity, number> = {
    all: afterStatusFilter.length,
    critical: afterStatusFilter.filter((f) => f.severity === "critical").length,
    major: afterStatusFilter.filter((f) => f.severity === "major").length,
    minor: afterStatusFilter.filter((f) => f.severity === "minor").length,
    info: afterStatusFilter.filter((f) => f.severity === "info").length,
  };

  const visible = afterStatusFilter.filter(
    (f) =>
      (severityFilter === "all" || f.severity === severityFilter) &&
      (memberFilter === null || f.assignedTo === memberFilter),
  );

  // Sort: open blocking first, then open non-blocking, then rest
  const sorted = [...visible].sort((a, b) => {
    if (a.status === "open" && b.status !== "open") return -1;
    if (b.status === "open" && a.status !== "open") return 1;
    if (a.blocking && !b.blocking) return -1;
    if (b.blocking && !a.blocking) return 1;
    const sevOrder: FindingSeverity[] = ["critical", "major", "minor", "info"];
    return sevOrder.indexOf(a.severity) - sevOrder.indexOf(b.severity);
  });

  const openBlockingCount = findings.filter(
    (f) => f.blocking && f.status === "open",
  ).length;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* ----------------------------------------------------------------- */}
      {/* Header                                                             */}
      {/* ----------------------------------------------------------------- */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-semibold tracking-tight">
                  {auditMeta.clientName}
                </span>
                <Badge
                  variant="outline"
                  className="rounded-full text-[10px] font-mono font-medium"
                >
                  {auditMeta.engagementRef}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {auditMeta.auditFirm} &middot; {auditMeta.auditPeriod}
              </p>
            </div>

            {openBlockingCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
                <AlertTriangle className="size-3.5" />
                {openBlockingCount} item
                {openBlockingCount !== 1 ? "s" : ""} blocking sign-off
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Main                                                               */}
      {/* ----------------------------------------------------------------- */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6 sm:px-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="bg-thermal bg-clip-text text-transparent">
              Audit Review Findings
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Please respond to each finding below. Items marked{" "}
            <span className="font-medium text-destructive">
              Blocking sign-off
            </span>{" "}
            must be resolved before the audit can be finalised.
            <span className="ml-1 text-muted-foreground">
              Responses due{" "}
              {new Date(auditMeta.dueDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              .
            </span>
          </p>
        </div>

        {/* Stats — thermal top accent stripe */}
        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="h-[3px] bg-thermal" />
          <div className="px-5 py-4">
            <AuditStats findings={findings} />
          </div>
        </div>

        {/* Team workload — click a member to filter the finding list */}
        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="h-[3px] bg-thermal" />
          <div className="px-5 py-4">
            <TeamWorkload
              findings={findings}
              activeId={memberFilter}
              onSelect={setMemberFilter}
            />
          </div>
        </div>

        {/* Filter + list */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FilterBar
              active={statusFilter}
              onChange={setStatusFilter}
              counts={statusCounts}
            />
            <span className="shrink-0 text-xs text-muted-foreground">
              {sorted.length} finding{sorted.length !== 1 ? "s" : ""}
            </span>
          </div>
          <SeverityFilterPills
            active={severityFilter}
            onChange={setSeverityFilter}
            counts={severityCounts}
          />

          <ScrollArea>
            <div className="space-y-3 pb-2">
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                  <CheckCircle2 className="size-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No findings in this category
                  </p>
                </div>
              ) : (
                sorted.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onRespond={handleRespond}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* Footer                                                             */}
      {/* ----------------------------------------------------------------- */}
      <footer className="border-t border-border/60">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
          <p className="text-xs text-muted-foreground">
            {auditMeta.auditFirm} &middot; Confidential &middot; For client
            review only. Do not distribute.
          </p>
        </div>
      </footer>
    </div>
  );
}
