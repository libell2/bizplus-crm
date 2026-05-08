/* eslint-disable */
const { useMemo: useMemoR } = React;

function RevenueView({ data }) {
  const { goals } = data;
  const summary = summarizeGoals(goals);

  // 25년 vs 26년 비교 (from goal sheet rows 0-23 we have 25 plan, 25 actual, 26 plan)
  // We don't have 25 monthly numbers in JSON; reconstruct rough numbers from spreadsheet known totals
  // Build channel split
  const byChannel = useMemoR(() => {
    const map = { 인바운드: { count: 0, monthly: 0, annual: 0 }, 아웃바운드: { count: 0, monthly: 0, annual: 0 } };
    data.deals.forEach(d => {
      if (map[d.channel]) {
        map[d.channel].count++;
        map[d.channel].monthly += d.monthly || 0;
        map[d.channel].annual += d.annual || 0;
      }
    });
    return map;
  }, [data.deals]);

  const byType = useMemoR(() => {
    const map = { 공항: { count: 0, monthly: 0 }, 로컬: { count: 0, monthly: 0 } };
    data.deals.forEach(d => {
      if (map[d.type]) {
        map[d.type].count++;
        map[d.type].monthly += d.monthly || 0;
      }
    });
    return map;
  }, [data.deals]);

  const byService = useMemoR(() => {
    const map = {};
    data.deals.forEach(d => {
      const k = d.service || "기타";
      if (!map[k]) map[k] = { count: 0, monthly: 0 };
      map[k].count++;
      map[k].monthly += d.monthly || 0;
    });
    return Object.entries(map).sort((a,b) => b[1].monthly - a[1].monthly);
  }, [data.deals]);

  const totalMonthly = data.deals.reduce((a, d) => a + (d.monthly || 0), 0);
  const totalAnnual = data.deals.reduce((a, d) => a + (d.annual || 0), 0);

  // Estimated revenue (0.77% of transaction)
  const estMonthlyRev = totalMonthly * 0.0077;
  const estAnnualRev = totalAnnual * 0.0077;

  // Quarter breakdown
  const quarters = useMemoR(() => {
    const q = [[0,1,2], [3,4,5], [6,7,8], [9,10,11]];
    return q.map((months, i) => {
      const goalSum = months.reduce((a, m) => a + (Number(goals.monthlyGoal[m]) || 0), 0);
      const actSum = months.reduce((a, m) => a + (Number(goals.monthlyActual[m]) || 0), 0);
      return { name: `${i+1}분기`, goal: goalSum, actual: actSum, rate: goalSum ? actSum / goalSum : 0, isPast: months[months.length-1] <= CURRENT_MONTH_IDX };
    });
  }, [goals]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top: revenue summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 14 }}>
        <Card padding={24} style={{ background: "linear-gradient(135deg, #15140f, #232017)", color: "#fff", border: "none", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: 999, background: "radial-gradient(circle, rgba(29,107,72,0.4), transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>예상 매출 (월)</div>
            <div className="mono" style={{ fontSize: 32, fontWeight: 700, marginTop: 8, letterSpacing: "-0.02em" }}>{KRW(estMonthlyRev)}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>월 거래액 {KRW(totalMonthly)} × 0.77%</div>
            <div style={{ display: "flex", gap: 18, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>연 매출 예상</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{KRW(estAnnualRev)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em", textTransform: "uppercase" }}>매출이익 (53%)</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 600, marginTop: 4, color: "#88e3a8" }}>{KRW(estAnnualRev * 0.53)}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card padding={20}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>오픈 기업 거래액</div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{KRW(totalAnnual)}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{data.deals.length}개 기업 · 연환산</div>
          <div style={{ marginTop: 14 }}>
            <ProgressBar value={summary.ytdActual} target={summary.annualGoal} color="var(--accent)" height={6} label="연간목표 달성률" />
          </div>
        </Card>

        <Card padding={20}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>인바운드 vs 아웃바운드</div>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <div style={{ flex: byChannel.인바운드.monthly || 1 }}>
              <div style={{ height: 80, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "flex-end", padding: 8 }}>
                <span className="mono" style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{byChannel.인바운드.count}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 6, fontWeight: 500 }}>인바운드</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{KRW(byChannel.인바운드.monthly)}</div>
            </div>
            <div style={{ flex: byChannel.아웃바운드.monthly || 1 }}>
              <div style={{ height: 80, background: "var(--neg)", borderRadius: 6, display: "flex", alignItems: "flex-end", padding: 8 }}>
                <span className="mono" style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{byChannel.아웃바운드.count}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 6, fontWeight: 500 }}>아웃바운드</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{KRW(byChannel.아웃바운드.monthly)}</div>
            </div>
          </div>
        </Card>

        <Card padding={20}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>공항 vs 로컬</div>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <div style={{ flex: byType.공항.monthly || 1 }}>
              <div style={{ height: 80, background: "#a83b2c", borderRadius: 6, display: "flex", alignItems: "flex-end", padding: 8 }}>
                <span className="mono" style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{byType.공항.count}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 6, fontWeight: 500 }}>공항</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{KRW(byType.공항.monthly)}</div>
            </div>
            <div style={{ flex: byType.로컬.monthly || 1 }}>
              <div style={{ height: 80, background: "#6c5b3c", borderRadius: 6, display: "flex", alignItems: "flex-end", padding: 8 }}>
                <span className="mono" style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{byType.로컬.count}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 6, fontWeight: 500 }}>로컬</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{KRW(byType.로컬.monthly)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quarter performance */}
      <Card padding={24}>
        <SectionTitle hint="2026년 분기별 신규거래액 목표 vs 성과">분기 실적</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {quarters.map((q, i) => (
            <div key={i} style={{
              background: q.isPast ? "var(--bg-sunken)" : "transparent",
              border: "1px solid var(--line)", borderRadius: 10, padding: 16,
              opacity: q.isPast ? 1 : 0.55,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{q.name}</span>
                {q.isPast && <Pill tone={q.rate >= 1 ? "pos" : q.rate >= 0.7 ? "warn" : "neg"} size="sm">
                  {(q.rate * 100).toFixed(0)}%
                </Pill>}
              </div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{KRW(q.actual)}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>목표 {KRW(q.goal)}</div>
              <div style={{ height: 4, background: "var(--bg-sunken)", borderRadius: 99, marginTop: 10 }}>
                <div style={{ height: "100%", width: `${Math.min(q.rate, 1) * 100}%`, background: q.rate >= 1 ? "var(--pos)" : "var(--accent)", borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Service breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
        <Card padding={24}>
          <SectionTitle hint="오픈 기업 기준 월 거래액">서비스별 매출 분포</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6 }}>
            {byService.map(([k, v]) => {
              const max = Math.max(...byService.map(s => s[1].monthly));
              const pct = v.monthly / max;
              const tone = k.includes("복지") ? "var(--accent)" : k.includes("식권") ? "var(--warn)" : "var(--neg)";
              return (
                <div key={k}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: tone }} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{k}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{v.count}건</span>
                    </div>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{KRW(v.monthly)}</span>
                  </div>
                  <div style={{ height: 7, background: "var(--bg-sunken)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct * 100}%`, background: tone, borderRadius: 99, transition: "width 700ms" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding={24}>
          <SectionTitle hint="3개년 연 매출 추이">연도별 비교</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6 }}>
            {[
              { year: "2024", revenue: 0, prev: true, label: "전년" },
              { year: "2025", revenue: 683170464, prev: true, label: "실적" },
              { year: "2026", revenue: estAnnualRev, prev: false, label: "예상" },
            ].map((y, i) => {
              const max = Math.max(estAnnualRev, 683170464, 600000000);
              return (
                <div key={y.year} style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "JetBrains Mono" }}>{y.year}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-3)" }}>{y.label}</div>
                  </div>
                  <div style={{ height: 22, background: "var(--bg-sunken)", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                    <div style={{
                      width: y.revenue ? `${(y.revenue / max) * 100}%` : "2%",
                      height: "100%",
                      background: y.prev ? "var(--ink-2)" : "linear-gradient(90deg, #4d5fc7, #2b3aa3)",
                      borderRadius: 4,
                    }} />
                  </div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 600, textAlign: "right", color: y.prev ? "var(--ink-2)" : "var(--accent)" }}>
                    {y.revenue ? KRW(y.revenue) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: "var(--bg-sunken)", borderRadius: 8, fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--ink)" }}>YoY 성장률</strong> · 2026 예상 매출은 25년 대비 {((estAnnualRev / 683170464 - 1) * 100).toFixed(1)}% 성장 예측
          </div>
        </Card>
      </div>

      {/* Top contributors */}
      <Card padding={0}>
        <div style={{ padding: "20px 24px 12px" }}>
          <SectionTitle hint="월 거래액 기여도 상위 10개사">매출 기여 TOP 10</SectionTitle>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "var(--bg-sunken)" }}>
            <tr>
              <ThR>순위</ThR><ThR>기업명</ThR><ThR>유형</ThR><ThR>서비스</ThR>
              <ThR align="right">월 거래액</ThR><ThR align="right">예상 월매출</ThR>
              <ThR align="right">기여도</ThR><ThR>담당</ThR>
            </tr>
          </thead>
          <tbody>
            {[...data.deals].sort((a,b) => (b.monthly||0) - (a.monthly||0)).slice(0, 10).map((d, i) => {
              const share = d.monthly / totalMonthly;
              return (
                <tr key={i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <TdR mono><span style={{ color: i < 3 ? "var(--accent)" : "var(--ink-3)", fontWeight: 700 }}>#{i + 1}</span></TdR>
                  <TdR><span style={{ fontWeight: 500 }}>{d.name}</span><span style={{ fontSize: 10.5, color: "var(--ink-4)", marginLeft: 6 }} className="mono">{d.code}</span></TdR>
                  <TdR><Pill tone={d.type === "공항" ? "neg" : "neutral"} size="sm">{d.type}</Pill></TdR>
                  <TdR><Pill tone={String(d.service).includes("복지") ? "accent" : "warn"} size="sm">{d.service}</Pill></TdR>
                  <TdR align="right" mono bold>{KRW(d.monthly)}</TdR>
                  <TdR align="right" mono>{KRW(d.monthly * 0.0077)}</TdR>
                  <TdR align="right">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                      <div style={{ width: 60, height: 5, background: "var(--bg-sunken)", borderRadius: 99 }}>
                        <div style={{ width: `${share * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 99 }} />
                      </div>
                      <span className="mono" style={{ fontSize: 12 }}>{(share * 100).toFixed(1)}%</span>
                    </div>
                  </TdR>
                  <TdR><Avatar name={d.owner} size={20} /></TdR>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const ThR = ({ children, align }) => (
  <th style={{ textAlign: align || "left", fontSize: 10.5, fontWeight: 500, color: "var(--ink-3)", padding: "12px 16px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{children}</th>
);
const TdR = ({ children, align, mono, bold }) => (
  <td style={{ textAlign: align || "left", padding: "12px 16px", fontSize: 12.5, fontFamily: mono ? "JetBrains Mono" : "inherit", fontWeight: bold ? 600 : 400 }}>{children}</td>
);

Object.assign(window, { RevenueView });
