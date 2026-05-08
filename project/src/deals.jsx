/* eslint-disable */
const { useState: useStateD2, useMemo: useMemoD2 } = React;

function DealsView({ data, onNew }) {
  const [type, setType] = useStateD2("전체");
  const [channel, setChannel] = useStateD2("전체");
  const [service, setService] = useStateD2("전체");
  const [owner, setOwner] = useStateD2("전체");
  const [q, setQ] = useStateD2("");
  const [sort, setSort] = useStateD2({ key: "monthly", dir: "desc" });

  const filtered = useMemoD2(() => {
    const arr = data.deals
      .filter(d => type === "전체" || d.type === type)
      .filter(d => channel === "전체" || d.channel === channel)
      .filter(d => service === "전체" || d.service === service)
      .filter(d => owner === "전체" || d.owner === owner)
      .filter(d => {
        if (!q) return true;
        const hay = `${d.name || ""} ${d.code || ""} ${d.industry || ""} ${d.region || ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      });
    const dir = sort.dir === "asc" ? 1 : -1;
    return arr.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (sort.key === "employees") {
        av = av === "-" ? 0 : (Number(av) || 0);
        bv = bv === "-" ? 0 : (Number(bv) || 0);
      }
      if (typeof av === "number" || typeof bv === "number") return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
      return String(av || "").localeCompare(String(bv || "")) * dir;
    });
  }, [data.deals, type, channel, service, owner, q, sort]);

  const totalMonthly = filtered.reduce((a, d) => a + (d.monthly || 0), 0);
  const totalAnnual = filtered.reduce((a, d) => a + (d.annual || 0), 0);

  const services = ["전체", ...Array.from(new Set(data.deals.map(d => d.service).filter(Boolean)))];
  const owners = ["전체", ...Array.from(new Set(data.deals.map(d => d.owner).filter(Boolean)))];
  const activeFilters = [type, channel, service, owner].filter(v => v !== "전체").length + (q ? 1 : 0);
  const reset = () => { setType("전체"); setChannel("전체"); setService("전체"); setOwner("전체"); setQ(""); };

  const SortTh = ({ children, k, align }) => <SortableTh sort={sort} setSort={setSort} sortKey={k} align={align}>{children}</SortableTh>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card padding={14} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", fontSize: 12 }}>⌕</span>
          <input placeholder="기업명·코드·업종 검색…" value={q} onChange={e => setQ(e.target.value)}
            style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 12px 8px 30px", fontSize: 13, fontFamily: "inherit", background: "var(--bg-sunken)", boxSizing: "border-box" }} />
        </div>
        <Select value={type} onChange={setType} options={["전체", "공항", "로컬"]} label="유형" />
        <Select value={channel} onChange={setChannel} options={["전체", "인바운드", "아웃바운드"]} label="채널" />
        <Select value={service} onChange={setService} options={services} label="서비스" />
        <Select value={owner} onChange={setOwner} options={owners} label="담당" />
        {activeFilters > 0 && <button onClick={reset} style={{ background: "transparent", color: "var(--neg)", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>초기화 ({activeFilters})</button>}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>월 거래 합계</span>
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{KRW(totalMonthly)}</span>
        <button onClick={onNew} style={{ background: "var(--ink)", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontSize: 13 }}>+ 신규 오픈</button>
      </Card>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <MiniKpi label={`오픈 기업수${activeFilters ? " (필터됨)" : ""}`} value={filtered.length + "건"} />
        <MiniKpi label="월 거래액 합계" value={KRW(totalMonthly)} />
        <MiniKpi label="연 거래액 합계" value={KRW(totalAnnual)} />
        <MiniKpi label="평균 임직원" value={Math.round(filtered.reduce((a, d) => a + (Number(d.employees) || 0), 0) / Math.max(filtered.length, 1)) + "명"} />
      </div>

      <Card padding={0}>
        <div style={{ overflow: "auto", maxHeight: 700 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: "var(--bg-sunken)", zIndex: 1 }}>
              <tr>
                <SortTh k="date">오픈일</SortTh>
                <SortTh k="name">기업명</SortTh>
                <SortTh k="type">유형</SortTh>
                <SortTh k="channel">채널</SortTh>
                <SortTh k="service">서비스</SortTh>
                <SortTh k="region">지역</SortTh>
                <SortTh k="employees" align="right">임직원</SortTh>
                <SortTh k="monthly" align="right">월 거래</SortTh>
                <SortTh k="annual" align="right">연 거래</SortTh>
                <SortTh k="owner">담당</SortTh>
                <Thd>비고</Thd>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  <Tdd mono>{fmtDate(d.date)}</Tdd>
                  <Tdd>
                    <div style={{ fontWeight: 500 }}>{d.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-4)" }} className="mono">{d.code}</div>
                  </Tdd>
                  <Tdd><Pill tone={d.type === "공항" ? "neg" : "neutral"} size="sm">{d.type}</Pill></Tdd>
                  <Tdd><span style={{ fontSize: 11.5, color: d.channel === "인바운드" ? "var(--accent)" : "var(--neg)" }}>{d.channel}</span></Tdd>
                  <Tdd><Pill tone={String(d.service).includes("복지") ? "accent" : "warn"} size="sm">{d.service}</Pill></Tdd>
                  <Tdd>{d.region}</Tdd>
                  <Tdd align="right" mono>{d.employees === "-" ? "—" : d.employees}</Tdd>
                  <Tdd align="right" mono bold>{KRW(d.monthly)}</Tdd>
                  <Tdd align="right" mono>{KRW(d.annual)}</Tdd>
                  <Tdd><Avatar name={d.owner} size={20} /></Tdd>
                  <Tdd><span style={{ color: "var(--ink-3)", fontSize: 11.5 }}>{d.policy || d.note}</span></Tdd>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} style={{ padding: 40, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>조건에 맞는 결과가 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const MiniKpi = ({ label, value }) => (
  <Card padding={14}>
    <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>{label}</div>
    <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 6, letterSpacing: "-0.02em" }}>{value}</div>
  </Card>
);
const Thd = ({ children, align }) => (
  <th style={{ textAlign: align || "left", fontSize: 10.5, fontWeight: 500, color: "var(--ink-3)", padding: "12px 14px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{children}</th>
);
const Tdd = ({ children, align, mono, bold }) => (
  <td style={{ textAlign: align || "left", padding: "12px 14px", fontSize: 12.5, fontFamily: mono ? "JetBrains Mono" : "inherit", fontWeight: bold ? 600 : 400 }}>{children}</td>
);

Object.assign(window, { DealsView });
