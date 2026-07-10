/**
 * Mock audit findings for the "Just Need Your Input" pattern.
 *
 * An auditor has reviewed the client's financials / filings and flagged a set
 * of items that need clarification or correction before the audit can be signed
 * off. Each finding has a severity, a category, the auditor's note, and a
 * client response that starts empty (null = "awaiting input" — render with
 * the shimmer treatment).
 */

export type FindingSeverity = "critical" | "major" | "minor" | "info";
export type FindingStatus = "open" | "responded" | "resolved" | "dismissed";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Tailwind bg color class for the avatar */
  color: string;
}

export const teamMembers: TeamMember[] = [
  { id: "tm-1", name: "Priya Nair",     initials: "PN", role: "CFO",               color: "bg-violet-500" },
  { id: "tm-2", name: "James Obi",      initials: "JO", role: "Controller",         color: "bg-fuego-500"  },
  { id: "tm-3", name: "Sara Lindqvist", initials: "SL", role: "Revenue Accounting", color: "bg-teal-500"   },
  { id: "tm-4", name: "Dani Reyes",     initials: "DR", role: "Accounts Payable",   color: "bg-sky-500"    },
];

export interface AuditFinding {
  id: string;
  ref: string;
  category: string;
  severity: FindingSeverity;
  status: FindingStatus;
  lineItem: string;
  auditorNote: string;
  auditorName: string;
  auditedAt: string;
  clientResponse: string | null;
  respondedAt: string | null;
  blocking: boolean;
  assignedTo: string;
  /** What the client should do next to resolve this finding. */
  recommendedAction: string;
}

export const mockAuditFindings: AuditFinding[] = [
  {
    id: "f-001",
    ref: "F-001",
    category: "Revenue Recognition",
    severity: "critical",
    status: "open",
    lineItem: "Q3 Software License Revenue — $2.4M",
    auditorNote:
      "Revenue appears to have been recognised in Q3 despite the contract execution date falling in Q4. ASC 606 requires recognition upon transfer of control. Please provide the signed contract and delivery confirmation.",
    auditorName: "M. Chen",
    auditedAt: "2026-07-01",
    clientResponse: null,
    respondedAt: null,
    blocking: true,
    assignedTo: "tm-3",
    recommendedAction:
      "Pull the signed contract and delivery receipt. If the delivery date falls in Q4, prepare a journal entry to reverse the Q3 recognition and restate into the correct period before resubmitting.",
  },
  {
    id: "f-002",
    ref: "F-002",
    category: "Accounts Payable",
    severity: "major",
    status: "responded",
    lineItem: "Vendor Invoice #8847 — Apex Consulting, $185,000",
    auditorNote:
      "Invoice date is June 30 but the purchase order was not approved until July 8. The expense appears to be recorded in the wrong period. Was this an accrual? If so, provide supporting documentation.",
    auditorName: "M. Chen",
    auditedAt: "2026-07-01",
    clientResponse:
      "Confirmed accrual. The service was performed in June per the statement of work dated June 1. PO approval was delayed due to an approver being on leave. Attaching the SOW and timesheet records.",
    respondedAt: "2026-07-03",
    blocking: false,
    assignedTo: "tm-4",
    recommendedAction:
      "Attach the signed SOW, June timesheet records, and the approver's out-of-office confirmation to your response. These three documents together should be sufficient to close this finding as a valid June accrual.",
  },
  {
    id: "f-003",
    ref: "F-003",
    category: "Fixed Assets",
    severity: "major",
    status: "open",
    lineItem: "Server Hardware Refresh — Asset #2241–2256",
    auditorNote:
      "Depreciation schedule shows straight-line over 3 years, but prior-year policy was 5 years. A change in useful-life estimate requires disclosure under ASC 250. No disclosure was found in the draft notes. Please clarify whether this was an intentional policy change.",
    auditorName: "T. Okafor",
    auditedAt: "2026-07-02",
    clientResponse: null,
    respondedAt: null,
    blocking: true,
    assignedTo: "tm-2",
    recommendedAction:
      "Draft a footnote disclosing the change in useful-life estimate under ASC 250. Confirm with legal whether the change is prospective only, then add the disclosure to the notes before resubmitting the fixed-asset schedule.",
  },
  {
    id: "f-004",
    ref: "F-004",
    category: "Payroll & Benefits",
    severity: "minor",
    status: "resolved",
    lineItem: "Bonus Accrual — Engineering Dept., $340,000",
    auditorNote:
      "Bonus accrual is present, but the performance threshold criteria were not documented in the workpapers. For completeness, please confirm the plan terms in writing.",
    auditorName: "T. Okafor",
    auditedAt: "2026-07-02",
    clientResponse:
      "Plan terms confirmed and attached. Threshold is 90% of ARR target. Engineering achieved 94% in H1. The accrual is calculated per the Board-approved comp plan dated Jan 15, 2026.",
    respondedAt: "2026-07-04",
    blocking: false,
    assignedTo: "tm-2",
    recommendedAction:
      "No adjustment needed. Submit the Board-approved comp plan and the H1 ARR actuals report to formally close this item — the accrual calculation and threshold are sufficiently documented.",
  },
  {
    id: "f-005",
    ref: "F-005",
    category: "Related Party Transactions",
    severity: "critical",
    status: "open",
    lineItem: "Consulting Fees — Ridgeline Partners LLC, $620,000",
    auditorNote:
      "Ridgeline Partners shares a director with the company. This meets the definition of a related party under ASC 850. No related-party disclosure was included in the draft financials. Please provide the contract and confirm whether board approval was obtained.",
    auditorName: "M. Chen",
    auditedAt: "2026-07-03",
    clientResponse: null,
    respondedAt: null,
    blocking: true,
    assignedTo: "tm-1",
    recommendedAction:
      "Add a related-party disclosure footnote to the financial statements. Provide the consulting contract, board minutes approving the engagement, and written confirmation that pricing was negotiated at arm's length.",
  },
  {
    id: "f-006",
    ref: "F-006",
    category: "Cash & Equivalents",
    severity: "info",
    status: "open",
    lineItem: "Operating Account — First National Bank #4492",
    auditorNote:
      "Bank reconciliation ties out, but there is an outstanding check (#10847, $12,500) that has been outstanding for 118 days. No escheatment risk assessment is on file. Not material, but please note for your compliance team.",
    auditorName: "T. Okafor",
    auditedAt: "2026-07-03",
    clientResponse: null,
    respondedAt: null,
    blocking: false,
    assignedTo: "tm-4",
    recommendedAction:
      "Contact the payee to confirm whether the check was received. If uncashed past your state's dormancy period, initiate escheatment proceedings. File a brief risk assessment memo for the audit workpapers.",
  },
  {
    id: "f-007",
    ref: "F-007",
    category: "Deferred Revenue",
    severity: "major",
    status: "open",
    lineItem: "Deferred Revenue Balance — $1.1M",
    auditorNote:
      "The rollforward schedule provided does not reconcile to the balance sheet by $47,200. The variance first appears in May. Please provide the detailed subledger and explain the discrepancy.",
    auditorName: "M. Chen",
    auditedAt: "2026-07-05",
    clientResponse: null,
    respondedAt: null,
    blocking: true,
    assignedTo: "tm-3",
    recommendedAction:
      "Run the deferred revenue subledger for January–May and isolate the $47,200 variance by contract line. Common causes include a missed recognition event or a manual journal without a matching subledger entry. Correct and resubmit the rollforward.",
  },
];

export const auditMeta = {
  clientName: "Meridian Software, Inc.",
  auditPeriod: "FY 2025 (Jan 1 – Dec 31, 2025)",
  auditFirm: "Chen & Okafor LLP",
  engagementRef: "ENG-2026-00147",
  requestedBy: "2026-07-10",
  dueDate: "2026-07-17",
};
