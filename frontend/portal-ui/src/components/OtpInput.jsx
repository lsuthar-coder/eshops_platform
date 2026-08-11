import { useRef } from "react";

export default function OtpInput({ value, onChange, disabled }) {
  const digits = value.padEnd(6, " ").split("").slice(0, 6);
  const inputRefs = useRef([]);

  function handleChange(index, raw) {
    const char = raw.replace(/[^0-9]/g, "").slice(-1);
    const next = value.split("");
    next[index] = char || "";
    const joined = next.join("").slice(0, 6);
    onChange(joined);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index].trim() && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          value={digit.trim()}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${index + 1}`}
          className="glass-input h-12 w-10 text-center text-lg"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      ))}
    </div>
  );
}
