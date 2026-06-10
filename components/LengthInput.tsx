"use client";

import { parseLength, formatLength } from "@/lib/fraction";
import { useSettings } from "./SettingsContext";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/** Text input that accepts feet-inch-fraction strings with a live preview. */
export default function LengthInput({
  label,
  value,
  onChange,
  placeholder,
}: Props) {
  const { settings } = useSettings();
  const parsed = value.trim() ? parseLength(value) : null;
  const invalid = value.trim() !== "" && parsed === null;

  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        className={invalid ? "invalid" : ""}
        value={value}
        placeholder={placeholder ?? `e.g. 3' 5-3/8"`}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className={`preview ${invalid ? "error" : ""}`}>
        {invalid
          ? `Can't read that — try 3' 5-3/8" or 41 3/4`
          : parsed
            ? `= ${formatLength(parsed, 16, settings.units).text}`
            : ""}
      </div>
    </div>
  );
}
