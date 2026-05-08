// Utility helpers shared across the CRM
const KRW = (n, opts = {}) => {
  if (n == null || n === "" || isNaN(n)) return "—";
  const v = Number(n);
  const abs = Math.abs(v);
  if (opts.compact !== false) {
    if (abs >= 1_0000_0000) return (v / 1_0000_0000).toFixed(abs >= 10_0000_0000 ? 1 : 2).replace(/\.0+$/, "") + "억";
    if (abs >= 1_0000) return (v / 1_0000).toFixed(0) + "만";
  }
  return v.toLocaleString("ko-KR");
};
const KRWFull = (n) => (n == null || isNaN(n)) ? "—" : Number(n).toLocaleString("ko-KR") + "원";
const PCT = (n, digits = 1) => (n == null || isNaN(n)) ? "—" : (n * 100).toFixed(digits) + "%";

// Excel serial -> Date
const excelToDate = (s) => {
  if (typeof s !== "number") return null;
  const d = new Date(Date.UTC(1899, 11, 30) + s * 86400000);
  return d;
};
const fmtDate = (s) => {
  const d = excelToDate(s);
  if (!d) return typeof s === "string" ? s : "—";
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
};
const fmtDateLong = (s) => {
  const d = excelToDate(s);
  if (!d) return "—";
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
};
const daysAgo = (s) => {
  const d = excelToDate(s);
  if (!d) return null;
  const today = new Date(Date.UTC(2026, 4, 6)); // 2026-05-06 (current date per system)
  return Math.floor((today - d) / 86400000);
};

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const CURRENT_MONTH_IDX = 4; // 5월 (May 2026)

// Aggregations
const summarizeGoals = (goals) => {
  const { monthlyGoal, monthlyActual, cumGoal, cumActual } = goals;
  const ytdActual = monthlyActual.slice(0, CURRENT_MONTH_IDX + 1).reduce((a, b) => a + (Number(b) || 0), 0);
  const ytdGoal = cumGoal[CURRENT_MONTH_IDX] || 0;
  const annualGoal = cumGoal[11] || 0;
  const monthGoal = monthlyGoal[CURRENT_MONTH_IDX] || 0;
  const monthActual = Number(monthlyActual[CURRENT_MONTH_IDX]) || 0;
  return { ytdActual, ytdGoal, annualGoal, monthGoal, monthActual, ytdRate: ytdGoal ? ytdActual / ytdGoal : 0, monthRate: monthGoal ? monthActual / monthGoal : 0, annualRate: annualGoal ? ytdActual / annualGoal : 0 };
};

// Status colors
const STATUS_META = {
  "오픈":      { fg: "#1d6b48", bg: "#e3f1e8", dot: "#1d6b48", short: "오픈" },
  "도입확정":   { fg: "#2b3aa3", bg: "#e8eafc", dot: "#2b3aa3", short: "확정" },
  "검토중":     { fg: "#8a6a14", bg: "#f5edd6", dot: "#c79518", short: "검토" },
  "보류":       { fg: "#6c5b3c", bg: "#ecead9", dot: "#a89868", short: "보류" },
  "실패":       { fg: "#a83b2c", bg: "#f6e4e0", dot: "#a83b2c", short: "실패" },
  "미컨택":     { fg: "#4a4842", bg: "#ecead9", dot: "#8a8780", short: "미컨택" },
};

Object.assign(window, { KRW, KRWFull, PCT, excelToDate, fmtDate, fmtDateLong, daysAgo, MONTHS, CURRENT_MONTH_IDX, summarizeGoals, STATUS_META });
