"use client";

import { format } from "date-fns";

interface Props {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}

// Clamp to January 2024
const MIN = new Date("2024-01-01T00:00:00Z");
const MAX = new Date("2024-01-31T23:30:00Z");

export default function DateTimePicker({ label, value, onChange }: Props) {
  const formatted = format(value, "yyyy-MM-dd'T'HH:mm");
  const minStr = "2024-01-01T00:00";
  const maxStr = "2024-01-31T23:30";

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="datetime-local"
        value={formatted}
        min={minStr}
        max={maxStr}
        onChange={(e) => {
          const d = new Date(e.target.value + ":00Z");
          if (!isNaN(d.getTime()) && d >= MIN && d <= MAX) onChange(d);
        }}
        className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white 
                   cursor-pointer w-full"
      />
      <span className="text-xs text-gray-400">January 2024 only</span>
    </div>
  );
}