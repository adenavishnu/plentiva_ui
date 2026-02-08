"use client";

import { PaymentProvider } from "@/types";

const providers: { value: PaymentProvider; label: string; icon: string; description: string }[] = [
  {
    value: PaymentProvider.RAZORPAY,
    label: "Razorpay",
    icon: "💳",
    description: "Pay with UPI, cards, net banking & wallets",
  },
  {
    value: PaymentProvider.PAYPAL,
    label: "PayPal",
    icon: "🅿️",
    description: "Pay securely using your PayPal account",
  },
  {
    value: PaymentProvider.PHONEPE,
    label: "PhonePe",
    icon: "📱",
    description: "Pay via PhonePe UPI or wallet",
  },
];

interface Props {
  selected: PaymentProvider | null;
  onSelect: (provider: PaymentProvider) => void;
}

export default function PaymentProviderSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Select Payment Method</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {providers.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onSelect(p.value)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              selected === p.value
                ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <span className="text-3xl">{p.icon}</span>
            <span className="text-sm font-semibold text-gray-900">{p.label}</span>
            <span className="text-center text-xs text-gray-500">{p.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
