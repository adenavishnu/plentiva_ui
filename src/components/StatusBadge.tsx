import { PaymentStatus } from "@/types";
import { statusColor } from "@/lib/utils";

export default function StatusBadge({ status }: { status: PaymentStatus | string }) {
  const colorClass = statusColor(status as PaymentStatus);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
