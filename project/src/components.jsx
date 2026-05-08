/* eslint-disable */
// Shared low-level UI components

const { useState, useEffect, useRef, useMemo } = React;

const Pill = ({ children, tone = "neutral", size = "md", style }) => {
  const tones = {
    neutral: { bg: "var(--neutral-soft)", fg: "var(--ink-2)" },
    accent:  { bg: "var(--accent-soft)", fg: "var(--accent)" },
    pos:     { bg: "var(--pos-soft)",    fg: "var(--pos)" },
    neg:     { bg: "var(--neg-soft)",    fg: "var(--neg)" },
    warn:    { bg: "var(--warn-soft)",   fg: "var(--warn)" },
    ghost:   { bg: "transparent",        fg: "var(--ink-3)" },
  };
  const t = tones[tone];
  const sz = size === "sm" ? { fs: 11, py: 2, px: 7 } : { fs: 12, py: 3, px: 9 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: t.bg, color: t.fg,
      fontSize: sz.fs, fontWeight: 500,
      padding: `${sz.py}px ${sz.px}px`,
      borderRadius: 999, lineHeight: 1.2,
      letterSpacing: "-0.01em",
      ...style,
    }}>{children}</span>
  );
};

const StatusPill = ({ status, size }) => {
  const m = STATUS_META[status] || STATUS_META["미컨택"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: size === "sm" ? 11 : 12, fontWeight: 500,
      color: m.fg, background: m.bg,
      padding: size === "sm" ? "2px 8px" : "3px 10px",
      borderRadius: 999, letterSpacing: "-0.01em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: m.dot }} />
      {status}
    </span>
  );
};

const Card = ({ children, style, padding = 20, ...rest }) => (
  <div {...rest} style={{
    background: "var(--bg-elev)",
    borderRadius: "var(--radius)",
    border: "1px solid var(--line)",
    padding,
    ...style,
  }}>{children}</div>
);

const Sparkline = ({ values, goals, height = 36, width = 220, accent = "var(--accent)" }) => {
  const all = [...values, ...(goals || [])].map(Number).filter(v => !isNaN(v) && v > 0);
  const max = Math.max(...all, 1);
  const w = width, h = height, n = values.length;
  const stepX = w / (n - 1);
  const path = values.map((v, i) => {
    const num = Number(v) || 0;
    return `${i === 0 ? "M" : "L"} ${i * stepX} ${h - (num / max) * (h - 4) - 2}`;
  }).join(" ");
  const fillPath = path + ` L ${(n - 1) * stepX} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={fillPath} fill={accent} opacity={0.08} />
      {goals && (
        <polyline
          fill="none" stroke="var(--ink-4)" strokeWidth={1} strokeDasharray="2 3"
          points={goals.map((g, i) => `${i * stepX},${h - (Number(g) / max) * (h - 4) - 2}`).join(" ")}
        />
      )}
      <path d={path} fill="none" stroke={accent} strokeWidth={1.6} strokeLinecap="round" />
      {values.map((v, i) => {
        const num = Number(v);
        if (!num) return null;
        return <circle key={i} cx={i * stepX} cy={h - (num / max) * (h - 4) - 2} r={1.8} fill={accent} />;
      })}
    </svg>
  );
};

const ProgressBar = ({ value, target, color = "var(--accent)", height = 6, label }) => {
  const pct = Math.max(0, Math.min(2, target ? value / target : 0));
  const overflow = pct > 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)" }}>
          <span>{label}</span>
          <span className="mono" style={{ color: overflow ? "var(--pos)" : "var(--ink-2)", fontWeight: 600 }}>{(pct * 100).toFixed(1)}%</span>
        </div>
      )}
      <div style={{ position: "relative", height, background: "var(--bg-sunken)", borderRadius: 99 }}>
        <div style={{
          width: `${Math.min(pct, 1) * 100}%`, height: "100%",
          background: color, borderRadius: 99,
          transition: "width 600ms cubic-bezier(.2,.8,.2,1)",
        }} />
        {overflow && (
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: `${Math.min(pct, 2) * 50}%`, height: "100%",
            background: `repeating-linear-gradient(45deg, ${color}, ${color} 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)`,
            borderRadius: 99,
          }} />
        )}
      </div>
    </div>
  );
};

const SectionTitle = ({ children, action, hint }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)", whiteSpace: "pre-line" }}>{children}</h3>
      {hint && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{hint}</span>}
    </div>
    {action}
  </div>
);

const IconBtn = ({ children, onClick, active, title }) => (
  <button onClick={onClick} title={title} style={{
    background: active ? "var(--ink)" : "transparent",
    color: active ? "#fff" : "var(--ink-2)",
    border: "1px solid " + (active ? "var(--ink)" : "var(--line)"),
    borderRadius: 8, padding: "6px 10px", cursor: "pointer",
    fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em",
    display: "inline-flex", alignItems: "center", gap: 6,
    transition: "all 150ms",
  }}>{children}</button>
);

const Avatar = ({ name, size = 24, color }) => {
  if (!name) return null;
  const initial = name[0];
  const palette = { "이종민": "#2b3aa3", "강동헌": "#a83b2c", "비즈플러스": "#1d6b48" };
  const bg = color || palette[name] || "#6c5b3c";
  return (
    <span style={{
      width: size, height: size, borderRadius: 999,
      background: bg, color: "#fff",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.46, fontWeight: 600, letterSpacing: "-0.02em", flexShrink: 0,
    }}>{initial}</span>
  );
};

const LiveDot = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>
    <span style={{
      width: 6, height: 6, borderRadius: 999, background: "var(--pos)",
      boxShadow: "0 0 0 0 rgba(29,107,72,0.4)",
      animation: "pulse 1.8s ease-out infinite",
    }} />
    LIVE
    <style>{`@keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(29,107,72,0.5)} 70%{box-shadow:0 0 0 8px rgba(29,107,72,0)} 100%{box-shadow:0 0 0 0 rgba(29,107,72,0)}}`}</style>
  </span>
);

Object.assign(window, { Pill, StatusPill, Card, Sparkline, ProgressBar, SectionTitle, IconBtn, Avatar, LiveDot, SortableTh });

function SortableTh({ children, sortKey, sort, setSort, align }) {
  const active = sort.key === sortKey;
  const arrow = !active ? "↕" : sort.dir === "asc" ? "↑" : "↓";
  return (
    <th onClick={() => setSort({ key: sortKey, dir: active && sort.dir === "desc" ? "asc" : "desc" })}
      style={{
        textAlign: align || "left", fontSize: 10.5, fontWeight: 500,
        color: active ? "var(--ink)" : "var(--ink-3)",
        padding: "10px 14px", letterSpacing: "0.04em", textTransform: "uppercase",
        cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
      }}
      onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
      onMouseLeave={e => e.currentTarget.style.color = active ? "var(--ink)" : "var(--ink-3)"}>
      {children}
      <span style={{ marginLeft: 6, opacity: active ? 1 : 0.4, fontSize: 10 }}>{arrow}</span>
    </th>
  );
}
