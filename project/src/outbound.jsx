/* eslint-disable */
const { useState: useStateO, useMemo: useMemoO } = React;

function OutboundView({ data, setData, onNew }) {
  const [q, setQ] = useStateO("");
  const [region, setRegion] = useStateO("전체");
  const [service, setService] = useStateO("전체");
  const [status, setStatus] = useStateO("전체");
  const [sort, setSort] = useStateO({ key: "lastUpdate", dir: "desc" });

  const inferStatus = (r) => {
    if (r.lastUpdate === "미컨택") return "미컨택";
    const d = r.detail || "";
    if (d.includes("오픈확정") || d.includes("미팅예정")) return "미팅 예정";
    if (d.includes("미팅완료") || d.includes("오픈 목표")) return "오픈 확정";
    if (d.includes("검토")) return "검토 중";
    if (d.includes("신규컨택") || d.includes("제안")) return "신규 컨택";
    return "검토 중";
  };

  const filtered = useMemoO(() => {
    const arr = data.outbound.filter(r => {
      if (q) {
        const hay = `${r.name || ""} ${r.contactName || ""} ${r.detail || ""} ${r.note || ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (region !== "전체" && !(r.region || "").includes(region)) return false;
      if (service !== "전체" && r.service !== service) return false;
      if (status !== "전체" && inferStatus(r) !== status) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return arr.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (sort.key === "lastUpdate") {
        av = av === "미컨택" ? 0 : (Number(av) || 0);
        bv = bv === "미컨택" ? 0 : (Number(bv) || 0);
      }
      if (sort.key === "employees") {
        av = av === "-" ? 0 : (Number(av) || 0);
        bv = bv === "-" ? 0 : (Number(bv) || 0);
      }
      if (typeof av === "number" || typeof bv === "number") return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
      return String(av || "").localeCompare(String(bv || "")) * dir;
    });
  }, [data.outbound, q, region, service, status, sort]);

  const regions = ["전체", ...Array.from(new Set(data.outbound.map(o => (o.region || "").split(" ")[0]).filter(Boolean)))];
  const services = ["전체", ...Array.from(new Set(data.outbound.map(o => o.service).filter(Boolean)))];
  const statuses = ["전체", "미팅 예정", "오픈 확정", "검토 중", "신규 컨택", "미컨택"];

  // Group by status (parsed from detail/lastUpdate)
  const grouped = useMemoO(() => {
    const groups = { "미팅 예정": [], "오픈 확정": [], "검토 중": [], "신규 컨택": [], "미컨택": [] };
    filtered.forEach(r => groups[inferStatus(r)].push(r));
    return groups;
  }, [filtered]);

  const activeFilters = [region, service, status].filter(v => v && v !== "전체").length + (q ? 1 : 0);
  const reset = () => { setQ(""); setRegion("전체"); setService("전체"); setStatus("전체"); };

  const SortTh = ({ children, k, align }) => <SortableTh sort={sort} setSort={setSort} sortKey={k} align={align}>{children}</SortableTh>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card padding={14} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", fontSize: 12 }}>⌕</span>
          <input placeholder="기업명·컨택·내용 검색…" value={q} onChange={e => setQ(e.target.value)}
            style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 12px 8px 30px", fontSize: 13, fontFamily: "inherit", background: "var(--bg-sunken)", boxSizing: "border-box" }} />
        </div>
        <Select value={status} onChange={setStatus} options={statuses} label="상태" />
        <Select value={service} onChange={setService} options={services} label="서비스" />
        <Select value={region} onChange={setRegion} options={regions} label="지역" />
        {activeFilters > 0 && <button onClick={reset} style={{ background: "transparent", color: "var(--neg)", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>초기화 ({activeFilters})</button>}
        <div style={{ flex: 1 }} />
        <Pill tone="ghost">{filtered.length} / {data.outbound.length}건</Pill>
        <button onClick={onNew} style={{ background: "var(--ink)", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontSize: 13 }}>+ 타겟 추가</button>
      </Card>

      {/* Status counts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {Object.entries(grouped).map(([k, v]) => {
          const tone = k === "오픈 확정" ? "pos" : k === "미팅 예정" ? "accent" : k === "검토 중" ? "warn" : "neutral";
          const isActive = status === k;
          return (
            <Card key={k} padding={14} onClick={() => setStatus(isActive ? "전체" : k)}
              style={{ cursor: "pointer", border: isActive ? "1.5px solid var(--accent)" : "1px solid var(--line)" }}>
              <Pill tone={tone} size="sm">{k}</Pill>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{v.length}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                임직원 {v.reduce((a, x) => a + (Number(x.employees) || 0), 0).toLocaleString()}명
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card padding={0}>
        <div style={{ overflow: "auto", maxHeight: 700 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: "var(--bg-sunken)", zIndex: 1 }}>
              <tr>
                <SortTh k="name">기업명</SortTh>
                <SortTh k="region">지역</SortTh>
                <SortTh k="employees" align="right">임직원</SortTh>
                <SortTh k="service">서비스</SortTh>
                <Tho>현황</Tho>
                <SortTh k="lastUpdate">마지막 업데이트</SortTh>
                <SortTh k="contactName">담당자</SortTh>
                <Tho>비고</Tho>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const isUncontacted = r.lastUpdate === "미컨택";
                const days = typeof r.lastUpdate === "number" ? daysAgo(r.lastUpdate) : null;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                    <Tdo><div style={{ fontWeight: 500 }}>{r.name}</div></Tdo>
                    <Tdo>{r.region || "—"}</Tdo>
                    <Tdo align="right" mono>{r.employees === "-" ? "—" : r.employees}</Tdo>
                    <Tdo><Pill tone={String(r.service).includes("복지") ? "accent" : "warn"} size="sm">{r.service}</Pill></Tdo>
                    <Tdo>
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--ink-2)" }}>{r.detail}</span>
                    </Tdo>
                    <Tdo>
                      {isUncontacted ? <Pill tone="neg" size="sm">미컨택</Pill> :
                       days != null ? (
                         <span className="mono" style={{ fontSize: 12, color: days > 30 ? "var(--neg)" : days > 14 ? "var(--warn)" : "var(--ink-2)" }}>
                           {fmtDate(r.lastUpdate)}
                           <span style={{ color: "var(--ink-4)", marginLeft: 6 }}>{days}일 전</span>
                         </span>
                       ) : "—"}
                    </Tdo>
                    <Tdo>
                      {r.contactName ? (
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.contactName}</div>
                          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{r.phone}</div>
                        </div>
                      ) : <span style={{ color: "var(--ink-4)" }}>—</span>}
                    </Tdo>
                    <Tdo><span style={{ color: "var(--ink-3)", fontSize: 12 }}>{r.note}</span></Tdo>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const Tho = ({ children, align }) => (
  <th style={{ textAlign: align || "left", fontSize: 10.5, fontWeight: 500, color: "var(--ink-3)", padding: "12px 14px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{children}</th>
);
const Tdo = ({ children, align, mono }) => (
  <td style={{ textAlign: align || "left", padding: "12px 14px", fontSize: 12.5, fontFamily: mono ? "JetBrains Mono" : "inherit" }}>{children}</td>
);

Object.assign(window, { OutboundView });
