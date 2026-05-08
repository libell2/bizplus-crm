/* eslint-disable */
const { useState: useStateI, useMemo: useMemoI } = React;

function InboundView({ data, setData, onNew }) {
  const [filter, setFilter] = useStateI({ status: "전체", owner: "전체", service: "전체", region: "전체", month: "전체", q: "" });
  const [sort, setSort] = useStateI({ key: "inflowDate", dir: "desc" });
  const [view, setView] = useStateI("kanban"); // kanban | list

  const filtered = useMemoI(() => {
    const arr = data.inbound.filter(r => {
      if (filter.status !== "전체" && r.status !== filter.status) return false;
      if (filter.owner !== "전체" && r.owner !== filter.owner) return false;
      if (filter.service !== "전체" && r.service !== filter.service) return false;
      if (filter.region !== "전체" && !(r.region || "").includes(filter.region)) return false;
      if (filter.month !== "전체" && r.month !== filter.month) return false;
      if (filter.q) {
        const q = filter.q.toLowerCase();
        const hay = `${r.name || ""} ${r.contactName || ""} ${r.detail || ""} ${r.region || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return arr.sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (typeof av === "number" || typeof bv === "number") return ((Number(av) || 0) - (Number(bv) || 0)) * dir;
      return String(av || "").localeCompare(String(bv || "")) * dir;
    });
  }, [data.inbound, filter, sort]);

  const resetFilters = () => setFilter({ status: "전체", owner: "전체", service: "전체", region: "전체", month: "전체", q: "" });
  const activeFilterCount = Object.entries(filter).filter(([k, v]) => v && v !== "전체").length;

  const owners = ["전체", ...Array.from(new Set(data.inbound.map(i => i.owner).filter(Boolean)))];
  const services = ["전체", ...Array.from(new Set(data.inbound.map(i => i.service).filter(Boolean)))];
  const regions = ["전체", ...Array.from(new Set(data.inbound.map(i => (i.region || "").split(" ")[0]).filter(Boolean)))];
  const months = ["전체", ...Array.from(new Set(data.inbound.map(i => i.month).filter(Boolean)))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Toolbar */}
      <Card padding={14} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", fontSize: 12 }}>⌕</span>
          <input
            placeholder="기업명·담당자·내용 검색…"
            value={filter.q}
            onChange={e => setFilter({ ...filter, q: e.target.value })}
            style={{
              width: "100%", border: "1px solid var(--line)", borderRadius: 8,
              padding: "8px 12px 8px 30px", fontSize: 13, fontFamily: "inherit",
              background: "var(--bg-sunken)", boxSizing: "border-box",
            }}
          />
        </div>
        <Select value={filter.status} onChange={v => setFilter({ ...filter, status: v })}
          options={["전체", "검토중", "도입확정", "오픈", "보류", "실패"]} label="상태" />
        <Select value={filter.owner} onChange={v => setFilter({ ...filter, owner: v })} options={owners} label="담당" />
        <Select value={filter.service} onChange={v => setFilter({ ...filter, service: v })} options={services} label="서비스" />
        <Select value={filter.region} onChange={v => setFilter({ ...filter, region: v })} options={regions} label="지역" />
        <Select value={filter.month} onChange={v => setFilter({ ...filter, month: v })} options={months} label="월" />
        {activeFilterCount > 0 && (
          <button onClick={resetFilters} style={{ background: "transparent", color: "var(--neg)", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
            초기화 ({activeFilterCount})
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{filtered.length}건</span>
        <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--bg-sunken)", borderRadius: 8 }}>
          <ToggleBtn active={view === "kanban"} onClick={() => setView("kanban")}>칸반</ToggleBtn>
          <ToggleBtn active={view === "list"} onClick={() => setView("list")}>리스트</ToggleBtn>
        </div>
        <button onClick={onNew} style={{
          background: "var(--ink)", color: "#fff", border: "none",
          padding: "8px 14px", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontSize: 13,
        }}>+ 신규 인입</button>
      </Card>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {["검토중", "도입확정", "오픈", "보류", "실패"].map(s => {
          const count = data.inbound.filter(i => i.status === s).length;
          const employees = data.inbound.filter(i => i.status === s).reduce((a, x) => a + (Number(x.employees) || 0), 0);
          const m = STATUS_META[s];
          return (
            <Card key={s} padding={14} style={{ borderLeft: `3px solid ${m.dot}`, borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: m.dot }} /> {s}
              </div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginTop: 4, letterSpacing: "-0.02em" }}>{count}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{employees.toLocaleString()}명</div>
            </Card>
          );
        })}
      </div>

      {view === "kanban" ? <Kanban items={filtered} setData={setData} data={data} /> : <ListView items={filtered} sort={sort} setSort={setSort} />}
    </div>
  );
}

function Kanban({ items, setData, data }) {
  const cols = ["검토중", "도입확정", "오픈", "보류", "실패"];
  const [dragOver, setDragOver] = useStateI(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, alignItems: "flex-start" }}>
      {cols.map(col => {
        const colItems = items.filter(i => i.status === col).slice(0, 30);
        const m = STATUS_META[col];
        return (
          <div key={col}
            onDragOver={e => { e.preventDefault(); setDragOver(col); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => {
              const idx = Number(e.dataTransfer.getData("text/idx"));
              const next = [...data.inbound];
              if (next[idx]) next[idx] = { ...next[idx], status: col };
              setData({ ...data, inbound: next });
              setDragOver(null);
            }}
            style={{
              background: dragOver === col ? "var(--bg-elev)" : "var(--bg-sunken)",
              borderRadius: 10, padding: 8, minHeight: 200,
              border: dragOver === col ? `1.5px dashed ${m.dot}` : "1px solid transparent",
              transition: "all 150ms",
            }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: m.dot }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{col}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{items.filter(i => i.status === col).length}</span>
              </div>
              <span style={{ fontSize: 14, color: "var(--ink-3)", cursor: "pointer" }}>+</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 600, overflowY: "auto" }}>
              {colItems.map((item, i) => {
                const realIdx = data.inbound.indexOf(item);
                return (
                  <div key={i} draggable
                    onDragStart={e => e.dataTransfer.setData("text/idx", String(realIdx))}
                    style={{
                      background: "#fff", padding: 12, borderRadius: 8,
                      border: "1px solid var(--line)", boxShadow: "var(--shadow-1)",
                      cursor: "grab",
                    }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginBottom: 8, lineHeight: 1.4 }}>
                      {item.region || "—"} · {item.employees}명 · {item.service}
                    </div>
                    {item.detail && (
                      <div style={{ fontSize: 10.5, color: "var(--ink-2)", marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.detail}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line-soft)", paddingTop: 6 }}>
                      <Avatar name={item.owner} size={18} />
                      <span className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>
                        {fmtDate(item.inflowDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {items.filter(i => i.status === col).length > 30 && (
                <div style={{ textAlign: "center", padding: 8, fontSize: 11, color: "var(--ink-3)" }}>+ {items.filter(i => i.status === col).length - 30}건 더보기</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ items, sort, setSort }) {
  const SortTh = ({ children, k, align }) => <SortableTh sort={sort} setSort={setSort} sortKey={k} align={align}>{children}</SortableTh>;
  return (
    <Card padding={0}>
      <div style={{ overflow: "auto", maxHeight: 600 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--bg-sunken)", zIndex: 1 }}>
            <tr>
              <SortTh k="status">상태</SortTh>
              <SortTh k="name">기업명</SortTh>
              <SortTh k="region">지역</SortTh>
              <SortTh k="employees" align="right">임직원</SortTh>
              <SortTh k="service">서비스</SortTh>
              <SortTh k="inflowDate">인입일</SortTh>
              <SortTh k="meetingDate">미팅</SortTh>
              <SortTh k="owner">담당</SortTh>
              <ThI>내용</ThI>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 100).map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                <TdI><StatusPill status={r.status} size="sm" /></TdI>
                <TdI><span style={{ fontWeight: 500 }}>{r.name}</span></TdI>
                <TdI>{r.region || "—"}</TdI>
                <TdI align="right" mono>{r.employees}</TdI>
                <TdI>{r.service}</TdI>
                <TdI mono>{fmtDate(r.inflowDate)}</TdI>
                <TdI mono>{fmtDate(r.meetingDate)}</TdI>
                <TdI><Avatar name={r.owner} size={20} /></TdI>
                <TdI><span style={{ color: "var(--ink-2)", fontSize: 12, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: 360 }}>{r.detail}</span></TdI>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length > 100 && (
        <div style={{ padding: 12, textAlign: "center", fontSize: 12, color: "var(--ink-3)", borderTop: "1px solid var(--line-soft)" }}>전체 {items.length}건 중 100건 표시</div>
      )}
    </Card>
  );
}

const Select = ({ value, onChange, options, label }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
    <span style={{ color: "var(--ink-3)" }}>{label}</span>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      border: "1px solid var(--line)", background: "var(--bg-elev)",
      borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: "inherit", cursor: "pointer",
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const ToggleBtn = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{
    background: active ? "#fff" : "transparent",
    boxShadow: active ? "var(--shadow-1)" : "none",
    color: active ? "var(--ink)" : "var(--ink-3)",
    border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
  }}>{children}</button>
);
const ThI = ({ children, align }) => (
  <th style={{ textAlign: align || "left", fontSize: 10.5, fontWeight: 500, color: "var(--ink-3)", padding: "10px 14px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{children}</th>
);
const TdI = ({ children, align, mono }) => (
  <td style={{ textAlign: align || "left", padding: "10px 14px", fontSize: 12.5, fontFamily: mono ? "JetBrains Mono" : "inherit", verticalAlign: "middle" }}>{children}</td>
);

Object.assign(window, { InboundView });
