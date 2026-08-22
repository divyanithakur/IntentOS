import type { IntentResult } from "../types/intent";

type Status = NonNullable<IntentResult["status"]>;

const statusStyles: Record<Status, string> = {
  pending: "bg-[#f4f1ea] text-[#8a5f22]",
  planned: "bg-[#e2efe7] text-[#2e7d63]",
  approved: "bg-[#d8e9df] text-[#205b47]",
  executing: "bg-[#f6e5d8] text-[#a85d2f]",
  completed: "bg-[#d8e9df] text-[#205b47]",
  failed: "bg-[#f5deda] text-[#a33e31]",
  cancelled: "bg-[#e7e5e0] text-[#66706b]",
};

export function StatusBadge({ status = "pending" }: { status?: string }) {
  const normalized = (status in statusStyles ? status : "pending") as Status;
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[normalized]}`}>{normalized}</span>;
}
