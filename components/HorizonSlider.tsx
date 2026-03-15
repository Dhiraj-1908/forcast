"use client";

import * as Slider from "@radix-ui/react-slider";

interface Props {
  value: number;
  onChange: (val: number) => void;
}

export default function HorizonSlider({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <label className="text-sm font-medium text-gray-500">
        Forecast Horizon:{" "}
        <span className="font-bold text-gray-900">{value}h</span>
      </label>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        min={0}
        max={48}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-1.5">
          <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-blue-500 rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Forecast horizon"
        />
      </Slider.Root>
      <div className="flex justify-between text-xs text-gray-400">
        <span>0h</span>
        <span>24h</span>
        <span>48h</span>
      </div>
    </div>
  );
}