/* eslint-disable */
const { useState: useStateM } = React;

function Modal({ title, onClose, children, size = "md" }) {
  const widths = { sm: 420, md: 560, lg: 720 };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(20,18,12,0.45)",
      backdropFilter: "blur(4px)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 150ms ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-elev)", borderRadius: 14,
        width: widths[size], maxWidth: "92vw", maxHeight: "88vh",
        boxShadow: "0 24px 64px -16px rgba(20,18,12,0.3)",
        display: "flex", flexDirection: "column",
        animation: "popIn 200ms cubic-bezier(.2,.8,.2,1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--line-soft)" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 18, color: "var(--ink-3)", cursor: "pointer", padding: 4, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 22, overflow: "auto" }}>{children}</div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes popIn{from{transform:scale(0.96);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-2)", letterSpacing: "-0.01em" }}>
        {label} {required && <span style={{ color: "var(--neg)" }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{hint}</span>}
    </div>
  );
}
const Input = (p) => (
  <input {...p} style={{
    border: "1px solid var(--line)", borderRadius: 7, padding: "8px 11px",
    fontSize: 13, fontFamily: "inherit", background: "var(--bg-elev)",
    outline: "none", ...p.style,
  }} onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--line)"} />
);
const Sel = ({ value, onChange, options, ...rest }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{
    border: "1px solid var(--line)", borderRadius: 7, padding: "8px 11px",
    fontSize: 13, fontFamily: "inherit", background: "var(--bg-elev)", cursor: "pointer",
  }} {...rest}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);
const Textarea = (p) => (
  <textarea {...p} style={{
    border: "1px solid var(--line)", borderRadius: 7, padding: "8px 11px",
    fontSize: 13, fontFamily: "inherit", background: "var(--bg-elev)",
    minHeight: 70, resize: "vertical", outline: "none", ...p.style,
  }} />
);
const PrimaryBtn = ({ children, ...p }) => (
  <button {...p} style={{
    background: "var(--ink)", color: "#fff", border: "none",
    padding: "9px 16px", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontSize: 13, ...p.style,
  }}>{children}</button>
);
const GhostBtn = ({ children, ...p }) => (
  <button {...p} style={{
    background: "transparent", color: "var(--ink-2)", border: "1px solid var(--line)",
    padding: "9px 16px", borderRadius: 8, fontWeight: 500, cursor: "pointer", fontSize: 13, ...p.style,
  }}>{children}</button>
);

// Toast
function Toast({ msg, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 200,
      background: "var(--ink)", color: "#fff",
      padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      boxShadow: "0 12px 32px -12px rgba(20,18,12,0.4)",
      animation: "slideUp 200ms cubic-bezier(.2,.8,.2,1)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: "#88e3a8" }} />
      {msg}
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

function todayExcelSerial() {
  const today = new Date(Date.UTC(2026, 4, 6));
  return Math.floor((today - new Date(Date.UTC(1899, 11, 30))) / 86400000);
}

function NewInboundModal({ onClose, onSave }) {
  const [f, setF] = useStateM({
    name: "", employees: "", region: "", service: "복지", status: "검토중",
    detail: "", contactName: "", phone: "", email: "", owner: "이종민", note: "",
  });
  const submit = () => {
    if (!f.name) return alert("기업명을 입력해주세요");
    onSave({
      month: `${new Date().getMonth() + 1}월`,
      inflowDate: todayExcelSerial(), consultDate: todayExcelSerial(), meetingDate: "",
      ...f, employees: Number(f.employees) || 0,
    });
    onClose();
  };
  return (
    <Modal title="신규 인바운드 인입" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="기업명" required><Input value={f.name} onChange={e => setF({...f, name: e.target.value})} placeholder="예: 한글과컴퓨터" /></Field>
        <Field label="임직원수"><Input type="number" value={f.employees} onChange={e => setF({...f, employees: e.target.value})} /></Field>
        <Field label="지역"><Input value={f.region} onChange={e => setF({...f, region: e.target.value})} placeholder="예: 강남" /></Field>
        <Field label="서비스"><Sel value={f.service} onChange={v => setF({...f, service: v})} options={["복지", "식권", "식권금액형", "식권쿠폰형", "복지포인트", "상품권"]} /></Field>
        <Field label="상태"><Sel value={f.status} onChange={v => setF({...f, status: v})} options={["검토중", "도입확정", "오픈", "보류", "실패"]} /></Field>
        <Field label="담당자"><Sel value={f.owner} onChange={v => setF({...f, owner: v})} options={["이종민", "강동헌"]} /></Field>
      </div>
      <Field label="컨택 이름/직급"><Input value={f.contactName} onChange={e => setF({...f, contactName: e.target.value})} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="연락처"><Input value={f.phone} onChange={e => setF({...f, phone: e.target.value})} placeholder="010-0000-0000" /></Field>
        <Field label="이메일"><Input value={f.email} onChange={e => setF({...f, email: e.target.value})} /></Field>
      </div>
      <Field label="내용"><Textarea value={f.detail} onChange={e => setF({...f, detail: e.target.value})} placeholder="복지정책, 단가, 검토사항 등" /></Field>
      <Field label="비고"><Input value={f.note} onChange={e => setF({...f, note: e.target.value})} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--line-soft)" }}>
        <GhostBtn onClick={onClose}>취소</GhostBtn>
        <PrimaryBtn onClick={submit}>추가</PrimaryBtn>
      </div>
    </Modal>
  );
}

function NewOutboundModal({ onClose, onSave }) {
  const [f, setF] = useStateM({
    name: "", employees: "", region: "", service: "복지",
    detail: "신규컨택 및 제안", contactName: "", phone: "", email: "", note: "",
  });
  const submit = () => {
    if (!f.name) return alert("기업명을 입력해주세요");
    onSave({ ...f, employees: f.employees || "-", lastUpdate: todayExcelSerial(), meetingDate: "" });
    onClose();
  };
  return (
    <Modal title="신규 아웃바운드 타겟" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="기업명" required><Input value={f.name} onChange={e => setF({...f, name: e.target.value})} /></Field>
        <Field label="임직원수"><Input type="number" value={f.employees} onChange={e => setF({...f, employees: e.target.value})} /></Field>
        <Field label="지역"><Input value={f.region} onChange={e => setF({...f, region: e.target.value})} /></Field>
        <Field label="서비스"><Sel value={f.service} onChange={v => setF({...f, service: v})} options={["복지", "식권", "식권금액형", "식권쿠폰형", "식권(발송형)", "복지포인트"]} /></Field>
      </div>
      <Field label="컨택 이름/직급"><Input value={f.contactName} onChange={e => setF({...f, contactName: e.target.value})} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="연락처"><Input value={f.phone} onChange={e => setF({...f, phone: e.target.value})} /></Field>
        <Field label="이메일"><Input value={f.email} onChange={e => setF({...f, email: e.target.value})} /></Field>
      </div>
      <Field label="현황"><Textarea value={f.detail} onChange={e => setF({...f, detail: e.target.value})} /></Field>
      <Field label="비고" hint="계열사, 영업 컨택 경위 등"><Input value={f.note} onChange={e => setF({...f, note: e.target.value})} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--line-soft)" }}>
        <GhostBtn onClick={onClose}>취소</GhostBtn>
        <PrimaryBtn onClick={submit}>추가</PrimaryBtn>
      </div>
    </Modal>
  );
}

function NewDealModal({ onClose, onSave }) {
  const [f, setF] = useStateM({
    name: "", code: "", employees: "", service: "복지포인트",
    introFee: "", monthly: "", annual: "",
    channel: "인바운드", industry: "", region: "", type: "로컬",
    owner: "이종민", note: "", policy: "",
  });
  const submit = () => {
    if (!f.name || !f.monthly) return alert("기업명과 월 거래액을 입력해주세요");
    const monthly = Number(f.monthly) || 0;
    onSave({
      ...f,
      date: todayExcelSerial(),
      employees: Number(f.employees) || 0,
      introFee: Number(f.introFee) || 0,
      monthly,
      annual: Number(f.annual) || monthly * 12,
    });
    onClose();
  };
  return (
    <Modal title="신규 오픈 딜 등록" onClose={onClose} size="lg">
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <Field label="기업명" required><Input value={f.name} onChange={e => setF({...f, name: e.target.value})} /></Field>
        <Field label="기업코드"><Input value={f.code} onChange={e => setF({...f, code: e.target.value.toUpperCase()})} placeholder="HANCOM" /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field label="유형"><Sel value={f.type} onChange={v => setF({...f, type: v})} options={["로컬", "공항"]} /></Field>
        <Field label="채널"><Sel value={f.channel} onChange={v => setF({...f, channel: v})} options={["인바운드", "아웃바운드"]} /></Field>
        <Field label="담당자"><Sel value={f.owner} onChange={v => setF({...f, owner: v})} options={["이종민", "강동헌"]} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field label="서비스"><Sel value={f.service} onChange={v => setF({...f, service: v})} options={["복지포인트", "식권금액형", "식권쿠폰형", "식권밀쿠폰", "복지", "식권"]} /></Field>
        <Field label="임직원수"><Input type="number" value={f.employees} onChange={e => setF({...f, employees: e.target.value})} /></Field>
        <Field label="지역"><Input value={f.region} onChange={e => setF({...f, region: e.target.value})} placeholder="경기 성남시" /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field label="월 거래액 (원)" required><Input type="number" value={f.monthly} onChange={e => setF({...f, monthly: e.target.value})} placeholder="190000000" /></Field>
        <Field label="연 거래액 (원)" hint="비워두면 월×12"><Input type="number" value={f.annual} onChange={e => setF({...f, annual: e.target.value})} /></Field>
        <Field label="도입비 (원)"><Input type="number" value={f.introFee} onChange={e => setF({...f, introFee: e.target.value})} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="업종"><Input value={f.industry} onChange={e => setF({...f, industry: e.target.value})} /></Field>
        <Field label="복지정책"><Input value={f.policy} onChange={e => setF({...f, policy: e.target.value})} placeholder="연 1,500,000원" /></Field>
      </div>
      <Field label="참고/비고"><Input value={f.note} onChange={e => setF({...f, note: e.target.value})} /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--line-soft)" }}>
        <GhostBtn onClick={onClose}>취소</GhostBtn>
        <PrimaryBtn onClick={submit}>등록</PrimaryBtn>
      </div>
    </Modal>
  );
}

// Quick action modal: triggered from header "+ 새 활동"
function QuickActionModal({ onClose, onPick }) {
  const items = [
    { key: "inbound", label: "인바운드 인입", desc: "신규 문의 인입 등록", icon: "◇", tone: "var(--accent)" },
    { key: "outbound", label: "아웃바운드 타겟", desc: "신규 컨택 타겟 추가", icon: "◈", tone: "var(--neg)" },
    { key: "deal", label: "오픈 딜", desc: "성사된 신규 거래 등록", icon: "◆", tone: "var(--pos)" },
  ];
  return (
    <Modal title="새 활동 추가" onClose={onClose} size="sm">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(it => (
          <button key={it.key} onClick={() => { onPick(it.key); onClose(); }} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: 14, border: "1px solid var(--line)", borderRadius: 10,
            background: "var(--bg-elev)", cursor: "pointer", textAlign: "left",
            fontFamily: "inherit", transition: "all 150ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = it.tone; e.currentTarget.style.background = "var(--bg-sunken)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--bg-elev)"; }}>
            <span style={{
              width: 36, height: 36, borderRadius: 8,
              background: it.tone + "22", color: it.tone,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700,
            }}>{it.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{it.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{it.desc}</div>
            </div>
            <span style={{ color: "var(--ink-4)", fontSize: 14 }}>→</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

Object.assign(window, { Modal, Field, Input, Sel, Textarea, PrimaryBtn, GhostBtn, Toast, NewInboundModal, NewOutboundModal, NewDealModal, QuickActionModal });
