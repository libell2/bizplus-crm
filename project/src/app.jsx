/* eslint-disable */
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [data, setData] = useStateA(null);
  const [tab, setTab] = useStateA("dashboard");
  const [modal, setModal] = useStateA(null); // 'inbound' | 'outbound' | 'deal' | 'quick' | null
  const [toast, setToast] = useStateA(null);

  useEffectA(() => {
    fetch("data/crm-data.json").then(r => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>
        데이터 로딩 중…
      </div>
    );
  }

  const summary = summarizeGoals(data.goals);

  const addInbound = (item) => {
    setData({ ...data, inbound: [item, ...data.inbound] });
    setToast(`${item.name} 인바운드 등록 완료`);
  };
  const addOutbound = (item) => {
    setData({ ...data, outbound: [item, ...data.outbound] });
    setToast(`${item.name} 아웃바운드 타겟 추가`);
  };
  const addDeal = (item) => {
    setData({ ...data, deals: [item, ...data.deals] });
    setToast(`${item.name} 오픈 딜 등록 완료`);
  };

  const openNewActivity = () => setModal("quick");
  const openNewInbound = () => setModal("inbound");
  const openNewOutbound = () => setModal("outbound");
  const openNewDeal = () => setModal("deal");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "224px 1fr", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        background: "#15140f", color: "#e8e6df",
        padding: "20px 14px", display: "flex", flexDirection: "column", gap: 18,
        borderRight: "1px solid #15140f", position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, #4d5fc7, #2b3aa3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, color: "#fff",
          }}>B+</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em" }}>비즈플러스제휴팀</div>
            <div style={{ fontSize: 10.5, color: "rgba(232,230,223,0.55)" }}>PAYCO 기업복지 CRM</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <NavItem icon="◐" label="대시보드" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
          <NavItem icon="◇" label="인바운드" badge={data.inbound.filter(i => i.status === "검토중").length} active={tab === "inbound"} onClick={() => setTab("inbound")} />
          <NavItem icon="◈" label="아웃바운드" badge={data.outbound.length} active={tab === "outbound"} onClick={() => setTab("outbound")} />
          <NavItem icon="◆" label="오픈 딜" badge={data.deals.length} active={tab === "deals"} onClick={() => setTab("deals")} />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "10px 0" }} />
          <NavItem icon="◑" label="매출 분석" active={tab === "revenue"} onClick={() => setTab("revenue")} />
          <NavItem icon="○" label="리포트" onClick={() => setToast("리포트는 곧 출시됩니다")} />
          <NavItem icon="○" label="설정" onClick={() => setToast("설정은 곧 출시됩니다")} />
        </nav>

        <div style={{ marginTop: "auto", padding: "12px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(232,230,223,0.55)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 6 }}>2026 YTD</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>{KRW(summary.ytdActual)}</div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginTop: 8, marginBottom: 6 }}>
            <div style={{ height: "100%", width: `${Math.min(summary.annualRate, 1) * 100}%`, background: "linear-gradient(90deg, #6c7ee0, #2b3aa3)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(232,230,223,0.55)" }}>
            연목표 {KRW(summary.annualGoal)} · {(summary.annualRate * 100).toFixed(1)}%
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
          <Avatar name="비즈플러스" size={24} />
          <div style={{ fontSize: 11.5, lineHeight: 1.3 }}>
            <div style={{ fontWeight: 500 }}>강동헌, 이종민</div>
            <div style={{ color: "rgba(232,230,223,0.55)", fontSize: 10 }}>2명 활성</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ padding: "22px 28px 60px", maxWidth: 1500, width: "100%" }}>
        <Header tab={tab} data={data} onNewActivity={openNewActivity} onSync={() => setToast("엑셀 시트 동기화 완료")} />
        {tab === "dashboard" && <Dashboard data={data} setTab={setTab} />}
        {tab === "inbound" && <InboundView data={data} setData={setData} onNew={openNewInbound} />}
        {tab === "outbound" && <OutboundView data={data} setData={setData} onNew={openNewOutbound} />}
        {tab === "deals" && <DealsView data={data} onNew={openNewDeal} />}
        {tab === "revenue" && <RevenueView data={data} />}
      </main>

      {modal === "quick" && <QuickActionModal onClose={() => setModal(null)} onPick={(k) => setModal(k)} />}
      {modal === "inbound" && <NewInboundModal onClose={() => setModal(null)} onSave={addInbound} />}
      {modal === "outbound" && <NewOutboundModal onClose={() => setModal(null)} onSave={addOutbound} />}
      {modal === "deal" && <NewDealModal onClose={() => setModal(null)} onSave={addDeal} />}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

function NavItem({ icon, label, badge, active, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", border: "none",
      background: active ? "rgba(255,255,255,0.08)" : "transparent",
      color: disabled ? "rgba(232,230,223,0.3)" : (active ? "#fff" : "rgba(232,230,223,0.78)"),
      borderRadius: 7, fontSize: 13, fontWeight: active ? 600 : 500,
      cursor: disabled ? "not-allowed" : "pointer", letterSpacing: "-0.01em",
      textAlign: "left", justifyContent: "space-between",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 16, fontSize: 11, opacity: 0.7 }}>{icon}</span>
        {label}
      </span>
      {badge != null && <span className="mono" style={{
        fontSize: 10, padding: "1px 6px", borderRadius: 99,
        background: active ? "var(--accent)" : "rgba(255,255,255,0.08)",
        color: active ? "#fff" : "rgba(232,230,223,0.7)", fontWeight: 600,
      }}>{badge}</span>}
    </button>
  );
}

function Header({ tab, data, onNewActivity, onSync }) {
  const titles = {
    dashboard: { title: "대시보드", sub: "팀 전체 매출·영업 현황 실시간 모니터링" },
    inbound: { title: "인바운드 관리", sub: `2026년 인입 ${data.inbound.length}건 · 오픈비율 ${((data.inbound.filter(i=>i.status==="오픈").length / data.inbound.length) * 100).toFixed(1)}%` },
    outbound: { title: "아웃바운드 관리", sub: `타겟 ${data.outbound.length}개 추적 중` },
    deals: { title: "오픈 딜", sub: `2026년 오픈 ${data.deals.length}개 기업` },
    revenue: { title: "매출 분석", sub: "거래액·매출·매출이익 시뮬레이션" },
  };
  const t = titles[tab];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 4, fontWeight: 500, letterSpacing: "0.02em" }}>
          비즈플러스제휴팀 · 주간관리 · 2026.05.06 (수)
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em" }}>{t.title}</h1>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>{t.sub}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <LiveDot />
        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>마지막 동기화 방금 전</span>
        <button onClick={onSync} style={{
          background: "var(--bg-elev)", color: "var(--ink-2)",
          border: "1px solid var(--line)", padding: "8px 12px",
          borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer", marginLeft: 6,
        }}>↗ 엑셀 동기화</button>
        <button onClick={onNewActivity} style={{
          background: "var(--ink)", color: "#fff",
          border: "none", padding: "8px 14px",
          borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
        }}>+ 새 활동</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
