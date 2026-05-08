/* eslint-disable */
const { useState: useStateD, useMemo: useMemoD } = React;

function Dashboard({ data, setTab }) {
  const { deals, inbound, outbound, goals } = data;
  const summary = summarizeGoals(goals);
  const monthIdx = CURRENT_MONTH_IDX;

  // Aggregate by channel
  const channelStats = useMemoD(() => {
    const out = { 인바운드: 0, 아웃바운드: 0 };
    deals.forEach(d => { if (out[d.channel] != null) out[d.channel] += d.monthly || 0; });
    return out;
  }, [deals]);

  // Aggregate by owner (this year monthly)
  const ownerStats = useMemoD(() => {
    const map = {};
    deals.forEach(d => {
      const k = d.owner || "기타";
      if (!map[k]) map[k] = { monthly: 0, count: 0, type: {} };
      map[k].monthly += d.monthly || 0;
      map[k].count += 1;
      map[k].type[d.type] = (map[k].type[d.type] || 0) + 1;
    });
    return map;
  }, [deals]);

  // Inbound funnel
  const funnel = useMemoD(() => {
    const order = ["검토중", "도입확정", "오픈", "보류", "실패"];
    const counts = {};
    inbound.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return order.map(k => ({ key: k, count: counts[k] || 0 }));
  }, [inbound]);

  // Recent inbound (last 12 by inflowDate)
  const recent = useMemoD(() => {
    return [...inbound]
      .filter(i => typeof i.inflowDate === "number")
      .sort((a, b) => b.inflowDate - a.inflowDate)
      .slice(0, 8);
  }, [inbound]);

  // Top deals this period
  const topDeals = useMemoD(() => {
    return [...deals].sort((a, b) => (b.monthly || 0) - (a.monthly || 0)).slice(0, 6);
  }, [deals]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 14 }}>
        <HeroKpiCard summary={summary} goals={goals} />
        <KpiCard
          label="이번 달 신규 거래액"
          value={KRW(summary.monthActual)}
          sub={<span>목표 {KRW(summary.monthGoal)}</span>}
          rate={summary.monthRate}
          chart={<Sparkline width={180} height={32} values={goals.monthlyActual} goals={goals.monthlyGoal} />}
        />
        <KpiCard
          label="누적 달성률"
          value={(summary.ytdRate * 100).toFixed(1) + "%"}
          sub={<span>{KRW(summary.ytdActual)} / {KRW(summary.ytdGoal)}</span>}
          rate={summary.ytdRate}
          chart={
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32, width: 180 }}>
              {goals.monthlyGoal.map((g, i) => {
                const a = Number(goals.monthlyActual[i]) || 0;
                const max = Math.max(...goals.monthlyGoal, ...goals.monthlyActual.map(x => Number(x) || 0));
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 1, opacity: i > monthIdx ? 0.35 : 1 }}>
                    <div style={{ height: `${(a / max) * 100}%`, background: i === monthIdx ? "var(--accent)" : "var(--ink-2)", borderRadius: 1 }} title={`${MONTHS[i]} ${KRW(a)}`} />
                  </div>
                );
              })}
            </div>
          }
        />
        <KpiCard
          label="활성 파이프라인"
          value={`${funnel[0].count + funnel[1].count}건`}
          sub={<span>예상 가치 {KRW(estimatePipelineValue(inbound, outbound))}</span>}
          rate={null}
          chart={
            <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 10, color: "var(--ink-3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>검토중</span><span className="mono">{funnel[0].count}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>도입확정</span><span className="mono" style={{ color: "var(--accent)" }}>{funnel[1].count}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>아웃바운드 추적</span><span className="mono">{outbound.length}</span></div>
            </div>
          }
        />
      </div>

      {/* Monthly trajectory */}
      <Card padding={24}>
        <SectionTitle hint="2026년 월별 신규 거래액 (목표 vs 성과)" action={
          <div style={{ display: "flex", gap: 8 }}>
            <Pill tone="accent">목표 {KRW(summary.annualGoal)}</Pill>
            <Pill tone={summary.ytdRate >= 1 ? "pos" : "warn"}>
              {summary.ytdRate >= 1 ? "▲" : "△"} {(summary.ytdRate * 100).toFixed(1)}% YTD
            </Pill>
          </div>
        }>월별 트래커</SectionTitle>
        <MonthlyTrajectory goals={goals} monthIdx={monthIdx} />
      </Card>

      {/* Two-up: Funnel + Owner */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
        <Card padding={24}>
          <SectionTitle hint="총 422건 (인바운드)" action={<Pill tone="ghost">YTD</Pill>}>{"인바운드 현황\n"}</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {funnel.map((f, i) => {
              const m = STATUS_META[f.key];
              const max = Math.max(...funnel.map(x => x.count));
              return (
                <div key={f.key} style={{ display: "grid", gridTemplateColumns: "84px 1fr 64px", gap: 14, alignItems: "center" }}>
                  <StatusPill status={f.key} size="sm" />
                  <div style={{ height: 8, background: "var(--bg-sunken)", borderRadius: 99, position: "relative", overflow: "hidden" }}>
                    <div style={{ width: `${(f.count / max) * 100}%`, height: "100%", background: m.dot, borderRadius: 99, transition: "width 800ms" }} />
                  </div>
                  <div className="mono" style={{ textAlign: "right", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{f.count}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding={24}>
          <SectionTitle hint="담당자별 거래액 분포">개인 성과</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(ownerStats).filter(([k]) => k !== "기타").sort((a,b) => b[1].monthly - a[1].monthly).map(([owner, stat]) => {
              const totalMonthly = Object.values(ownerStats).reduce((a, b) => a + b.monthly, 0);
              const share = stat.monthly / totalMonthly;
              return (
                <div key={owner}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={owner} size={22} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{owner}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{stat.count}건</span>
                    </div>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{KRW(stat.monthly)}</span>
                  </div>
                  <ProgressBar value={share} target={1} color={owner === "이종민" ? "var(--accent)" : "var(--neg)"} height={5} />
                  <div style={{ display: "flex", gap: 6, marginTop: 6, fontSize: 11, color: "var(--ink-3)" }}>
                    {Object.entries(stat.type).map(([t, c]) => (
                      <span key={t}>{t} {c}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top deals & Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14 }}>
        <Card padding={0}>
          <div style={{ padding: "20px 24px 12px" }}>
            <SectionTitle hint="이번 분기 오픈 기준" action={<a onClick={() => setTab && setTab("deals")} style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer", textDecoration: "none" }}>전체보기 →</a>}>주요 오픈 딜</SectionTitle>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderTop: "1px solid var(--line-soft)", borderBottom: "1px solid var(--line-soft)", background: "var(--bg-sunken)" }}>
                <Th>기업</Th><Th>서비스</Th><Th>유형</Th><Th align="right">월 거래액</Th><Th align="right">연 거래액</Th><Th>담당</Th>
              </tr>
            </thead>
            <tbody>
              {topDeals.map((d, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <Td>
                    <div style={{ fontWeight: 500 }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{d.region} · {d.employees}명</div>
                  </Td>
                  <Td><Pill tone={d.service?.includes("복지") ? "accent" : "warn"} size="sm">{d.service}</Pill></Td>
                  <Td><Pill tone={d.type === "공항" ? "neg" : "neutral"} size="sm">{d.type}</Pill></Td>
                  <Td align="right" mono bold>{KRW(d.monthly)}</Td>
                  <Td align="right" mono>{KRW(d.annual)}</Td>
                  <Td><Avatar name={d.owner} size={20} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card padding={24}>
          <SectionTitle action={<LiveDot />} hint="최근 인입">실시간 활동</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recent.map((r, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10,
                padding: "10px 0",
                borderBottom: i < recent.length - 1 ? "1px dashed var(--line-soft)" : "none",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: STATUS_META[r.status]?.dot || "#888" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                    {r.service} · {r.region || "-"} · {r.employees}명
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusPill status={r.status} size="sm" />
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 4 }}>{fmtDate(r.inflowDate)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function HeroKpiCard({ summary, goals }) {
  return (
    <Card padding={24} style={{ background: "linear-gradient(135deg, #15140f 0%, #232017 100%)", color: "#fff", border: "1px solid #15140f", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: 999, background: "radial-gradient(circle, rgba(43,58,163,0.4) 0%, transparent 60%)" }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>2026 연 누적</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>YTD as of 5월 1주차</div>
          </div>
          <Pill tone={summary.ytdRate >= 1 ? "pos" : "warn"} style={{ background: summary.ytdRate >= 1 ? "rgba(29,107,72,0.3)" : "rgba(138,106,20,0.35)", color: summary.ytdRate >= 1 ? "#88e3a8" : "#f3d171" }}>
            {summary.ytdRate >= 1 ? "▲ 페이스 초과" : "△ 추격중"}
          </Pill>
        </div>
        <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "JetBrains Mono", fontFeatureSettings: '"tnum"' }}>
          {KRW(summary.ytdActual)}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
          연목표 {KRW(summary.annualGoal)} · 달성률 <span style={{ color: "#fff", fontWeight: 600 }} className="mono">{(summary.annualRate * 100).toFixed(1)}%</span>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 99, position: "relative", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(summary.annualRate, 1) * 100}%`, height: "100%", background: "linear-gradient(90deg, #4d5fc7, #2b3aa3)", borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>
            <span>YTD {(summary.annualRate * 100).toFixed(1)}%</span>
            <span>잔여 {KRW(summary.annualGoal - summary.ytdActual)}</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function KpiCard({ label, value, sub, rate, chart }) {
  return (
    <Card padding={20} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 152 }}>
      <div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 8, fontFamily: "JetBrains Mono", fontFeatureSettings: '"tnum"' }}>{value}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{sub}</div>
      </div>
      <div style={{ marginTop: 12 }}>{chart}</div>
    </Card>
  );
}

function MonthlyTrajectory({ goals, monthIdx }) {
  const max = Math.max(...goals.monthlyGoal, ...goals.monthlyActual.map(x => Number(x) || 0));
  const height = 180;
  const colW = 100 / 12;
  return (
    <div style={{ position: "relative", height: height + 40, marginTop: 8 }}>
      {/* Grid */}
      <svg width="100%" height={height} style={{ position: "absolute", top: 0, left: 0 }}>
        {[0.25, 0.5, 0.75].map(y => (
          <line key={y} x1="0" x2="100%" y1={height * (1 - y)} y2={height * (1 - y)} stroke="var(--line-soft)" strokeDasharray="2 4" />
        ))}
        {/* Goal line */}
        <polyline
          fill="none" stroke="var(--ink-4)" strokeWidth={1.4} strokeDasharray="4 4"
          points={goals.monthlyGoal.map((g, i) => {
            const x = (i + 0.5) * (100 / 12);
            const y = height - (Number(g) / max) * (height - 12) - 6;
            return `${x}%,${y}`;
          }).join(" ")}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Bars */}
      <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", height }}>
        {goals.monthlyGoal.map((g, i) => {
          const a = Number(goals.monthlyActual[i]) || 0;
          const aH = (a / max) * (height - 12);
          const gH = (Number(g) / max) * (height - 12);
          const isPast = i <= monthIdx;
          const isCurrent = i === monthIdx;
          const rate = g ? a / g : 0;
          const fillColor = !isPast ? "var(--bg-sunken)" : (rate >= 1 ? "var(--accent)" : rate >= 0.7 ? "#7d8ad4" : "var(--warn)");
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", position: "relative", gap: 2, paddingInline: 4 }}>
              {isPast && (
                <span style={{ fontSize: 10, color: rate >= 1 ? "var(--pos)" : "var(--ink-3)", fontWeight: 600, marginBottom: 2 }} className="mono">{(rate * 100).toFixed(0)}%</span>
              )}
              <div style={{ width: "100%", maxWidth: 36, height: aH, background: fillColor, borderRadius: "4px 4px 0 0", position: "relative", border: isCurrent ? "1px solid var(--accent)" : "none" }} title={`${MONTHS[i]}: ${KRW(a)} / 목표 ${KRW(g)}`} />
            </div>
          );
        })}
      </div>
      {/* Month labels */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", height: 32 }}>
        {MONTHS.map((m, i) => (
          <div key={m} style={{ flex: 1, textAlign: "center", paddingTop: 8 }}>
            <div style={{ fontSize: 11, color: i === monthIdx ? "var(--ink)" : "var(--ink-3)", fontWeight: i === monthIdx ? 600 : 400 }}>{m}</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--ink-4)", marginTop: 2 }}>{KRW(goals.monthlyGoal[i])}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Th = ({ children, align }) => (
  <th style={{ textAlign: align || "left", fontSize: 11, fontWeight: 500, color: "var(--ink-3)", padding: "10px 16px", letterSpacing: "0.02em", textTransform: "uppercase" }}>{children}</th>
);
const Td = ({ children, align, mono, bold }) => (
  <td style={{ textAlign: align || "left", padding: "12px 16px", fontSize: 13, fontWeight: bold ? 600 : 400, fontFamily: mono ? "JetBrains Mono" : "inherit", letterSpacing: mono ? "-0.01em" : 0 }}>{children}</td>
);

function estimatePipelineValue(inbound, outbound) {
  // rough heuristic: parse numbers from `detail` strings
  const sum = arr => arr.reduce((a, x) => {
    const m = (x.detail || "").match(/연\s*([\d,]+)\s*만/);
    if (m) return a + parseInt(m[1].replace(/,/g, ""), 10) * 10000;
    const m2 = (x.detail || "").match(/월\s*([\d,]+)\s*만/);
    if (m2) return a + parseInt(m2[1].replace(/,/g, ""), 10) * 10000 * 12;
    return a + (x.employees > 0 ? x.employees * 200000 * 12 : 0);
  }, 0);
  return sum(inbound.filter(i => i.status === "검토중" || i.status === "도입확정")) + sum(outbound) * 0.3;
}

Object.assign(window, { Dashboard });
