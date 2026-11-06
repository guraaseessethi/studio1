const TONES: Record<string, { bg: string; fg: string; text: string }> = {
  new: { bg: "#c8a886", fg: "#0f0f0f", text: "NEW" },
  confirmed: { bg: "#0f0f0f", fg: "#ffffff", text: "OK" },
  completed: { bg: "#e7dacb", fg: "#3d3935", text: "DONE" },
  "no-show": { bg: "#8a6a50", fg: "#ffffff", text: "NO" },
  cancelled: { bg: "#d8d0c8", fg: "#5a5550", text: "X" },
};

export function StatusBadge({ status }: { status?: string }) {
  const tone = TONES[status ?? "new"] ?? TONES.new;
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: tone.bg,
        color: tone.fg,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      {tone.text}
    </span>
  );
}
