import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowRight, ArrowLeft, Check, Lock, Shield, FileText, Building2,
  User, DollarSign, Landmark, Globe2, ClipboardCheck, Upload,
  AlertCircle, Eye, Copy, Download
} from "lucide-react";

// ============================================================
// PRANA GLOBAL VENTURES — PRIVATE LP INTAKE
// Token-gated. Discreet. Maps 1:1 to subscription agreement.
// ============================================================

const FUND_INFO = {
  name: "Prana Global Ventures",
  fund: "Prana Global Ventures, LP",
  closing: "May 31, 2026",
  minimumCommitment: 1000000, // Per A&R LPA § 3.2(a). GP may accept a lesser amount in its sole discretion.
  maximumAmount: 50000000,    // Per A&R LPA § 3.2(a). May be exceeded only with consent of a Majority of Prana Investors.
};

// Per-LP tokens. Each is unique and tied to a specific prospective LP from the active pipeline.
// Prefix legend: FF = Family & Friends, SC = Soft Commit, DO = Digital Onda,
// BOFA = Bank of America, FO = Family Office, D82 = D82 Capital,
// PF = Pending Feedback, LP = unassigned/spare, ADM = Admin (GP console).
const TOKENS = {
  // COMMITTED
  "FF-MINALDI-WLVZ":   { role: "investor", label: "Chandler + Keller",       prefill: { entityName: "Chandler Minaldi" } },
  "FF-WONG-LYND":      { role: "investor", label: "Amy & Arnold Wong",       prefill: { entityName: "Amy & Arnold Wong" } },
  "FF-THADANI-69ZT":   { role: "investor", label: "Shravan Thadani",         prefill: { entityName: "Shravan Thadani" } },
  "FF-GUPTE-U2FX":     { role: "investor", label: "Shubie Gupte",            prefill: { entityName: "Shubie Gupte" } },
  "FF-STEFAN-U9QZ":    { role: "investor", label: "Stefan",                  prefill: { entityName: "Stefan" } },

  // SOFT COMMITS
  "SC-BLOUNT-FTFF":    { role: "investor", label: "Greg Blount",             prefill: { entityName: "Greg Blount" } },
  "SC-RAIZNER-34BY":   { role: "investor", label: "Josh Raizner",            prefill: { entityName: "Josh Raizner" } },

  // PENDING FEEDBACK / HIGH-PRIORITY
  "DO-NEMTIN-DUJY":    { role: "investor", label: "Ben Nemtin + Jordan",     prefill: { entityName: "Ben Nemtin" } },
  "BOFA-BALLARD-XJ9M": { role: "investor", label: "BofA / Neena Ballard",    prefill: { entityName: "Bank of America - Neena Ballard" } },
  "FO-SCOTT-5HZE":     { role: "investor", label: "Kendra Scott FO",         prefill: { entityName: "Kendra Scott Family Office" } },
  "D82-BROOKS-HNMS":   { role: "investor", label: "D82 Capital / Dishon",    prefill: { entityName: "D82 Capital - Dishon Brooks" } },
  "PF-STONE-F92H":     { role: "investor", label: "Jacquie Stone",           prefill: { entityName: "Jacquie Stone" } },
  "PF-STURR-L9X7":     { role: "investor", label: "Lizzie Sturr",            prefill: { entityName: "Lizzie Sturr" } },
  "FF-JAKEM-23U9":     { role: "investor", label: "Jake Minaldi",            prefill: { entityName: "Jake Minaldi" } },
  "PF-DZACK-E5KE":     { role: "investor", label: "Darren & Zack",           prefill: { entityName: "Darren & Zack" } },

  // SPARES — for new LPs you want to send a link to quickly. Just assign one and email the link.
  "LP-001-95VG":       { role: "investor", label: "Unassigned · LP-001",     prefill: {} },
  "LP-002-RXGM":       { role: "investor", label: "Unassigned · LP-002",     prefill: {} },
  "LP-003-KVTX":       { role: "investor", label: "Unassigned · LP-003",     prefill: {} },
  "LP-004-Q975":       { role: "investor", label: "Unassigned · LP-004",     prefill: {} },
  "LP-005-6LVB":       { role: "investor", label: "Unassigned · LP-005",     prefill: {} },
  "LP-006-PTXH":       { role: "investor", label: "Unassigned · LP-006",     prefill: {} },
  "LP-007-6MJ2":       { role: "investor", label: "Unassigned · LP-007",     prefill: {} },
  "LP-008-XBNX":       { role: "investor", label: "Unassigned · LP-008",     prefill: {} },
  "LP-009-M3WF":       { role: "investor", label: "Unassigned · LP-009",     prefill: {} },
  "LP-010-N7EW":       { role: "investor", label: "Unassigned · LP-010",     prefill: {} },

  // GP CONSOLE
  "ADM-PRANA-MZHV":    { role: "admin",    label: "Admin (GP Console)",      prefill: {} },
};

const STEPS = [
  { id: "investor", label: "Investor Information", icon: User },
  { id: "commitment", label: "Capital Commitment", icon: DollarSign },
  { id: "contacts", label: "Contacts & Notices", icon: FileText },
  { id: "wire", label: "Wire Instructions", icon: Landmark },
  { id: "accredited", label: "Accredited Investor", icon: ClipboardCheck },
  { id: "qualified", label: "Qualified Purchaser", icon: ClipboardCheck },
  { id: "cfius", label: "CFIUS Status", icon: Globe2 },
  { id: "erisa", label: "Benefit Plan", icon: Shield },
  { id: "tax", label: "Tax Form", icon: FileText },
  { id: "uploads", label: "Supporting Documents", icon: Upload },
  { id: "review", label: "Review & Submit", icon: Check },
];

const INVESTOR_TYPES = [
  "Individual (investing individually or married)",
  "Joint Tenants",
  "Corporation",
  "Partnership",
  "Limited Liability Company",
  "Trust",
  "Exempt Organization",
  "IRA / Benefit Plan",
  "Other",
];

const ACCREDITED_CATEGORIES = [
  { id: "ai_1", label: "Natural person — net worth > $1M (excl. primary residence)" },
  { id: "ai_2", label: "Natural person — income > $200K (or $300K joint) in each of last 2 years" },
  { id: "ai_3", label: "Entity with total assets > $5M (not formed to acquire these securities)" },
  { id: "ai_4", label: "Private business development company (Investment Advisers Act § 202(a)(22))" },
  { id: "ai_5", label: "Bank, broker-dealer, RIA, insurance company, ICA-registered fund, SBIC, or qualifying employee benefit plan" },
  { id: "ai_6", label: "Trust with assets > $5M, directed by a sophisticated person" },
  { id: "ai_7", label: "Director, executive officer, or GP of the Fund (or of the GP)" },
  { id: "ai_8", label: "Revocable trust whose grantor is an accredited investor under 1–7" },
  { id: "ai_9", label: "Entity not in 3,4,5,6,8,14 with investments > $5M" },
  { id: "ai_10", label: "Natural person holding Series 7, 65, or 82 license in good standing" },
  { id: "ai_11", label: "Knowledgeable Employee of the Fund, GP, or Management Company" },
  { id: "ai_12", label: "Family office with AUM > $5M, directed by a sophisticated person" },
  { id: "ai_13", label: "Family client of a qualifying family office (item 12)" },
  { id: "ai_14", label: "Entity in which all equity owners are accredited investors" },
];

const QP_CATEGORIES = [
  { id: "qp_1", label: "Natural person owning ≥ $5M in investments" },
  { id: "qp_2", label: "Natural person or company with ≥ $25M discretionary investments" },
  { id: "qp_3", label: "Qualified institutional buyer (Rule 144A) meeting Rule 2a51-1(g)" },
  { id: "qp_4", label: "Family-owned company — ≥ $5M investments, owned by related natural persons" },
  { id: "qp_5", label: "Trust where each settlor & trustee is a qualified purchaser" },
  { id: "qp_6", label: "Company whose securities are all beneficially owned by qualified purchasers" },
  { id: "qp_7", label: "Knowledgeable Employee under Rule 3c-5(a)(4)" },
  { id: "qp_none", label: "Not a qualified purchaser" },
];

const CFIUS_CATEGORIES = [
  { id: "cf_1", label: "Foreign national (citizen of a non-U.S. country)" },
  { id: "cf_2", label: "Foreign government or foreign-government-controlled entity" },
  { id: "cf_3", label: "Foreign entity organized under non-U.S. law" },
  { id: "cf_4", label: "U.S. entity controlled by a foreign person" },
  { id: "cf_5", label: "U.S. national over whom a foreign person exercises control" },
  { id: "cf_6", label: "Not a foreign person under any of the above" },
];

const ERISA_QUESTIONS = [
  { id: "erisa_a", label: "Investor is, or acts on behalf of, a 'benefit plan investor' under 29 C.F.R. § 2510.3-101(f)(2)" },
  { id: "erisa_b", label: "Investor is, or acts on behalf of, a 'church plan' (ERISA § 3(33)) that has not elected ERISA coverage" },
  { id: "erisa_c", label: "Investor is, or acts on behalf of, a 'governmental plan' (ERISA § 3(32))" },
  { id: "erisa_d", label: "Investor is, or acts on behalf of, an entity holding 'plan assets'" },
  { id: "erisa_e", label: "Investor is a non-U.S. plan established primarily for non-U.S. participants" },
];

const TAX_FORMS = [
  { id: "w9", label: "Form W-9", desc: "U.S. persons / entities" },
  { id: "w8ben", label: "Form W-8BEN", desc: "Non-U.S. individuals" },
  { id: "w8bene", label: "Form W-8BEN-E", desc: "Non-U.S. entities" },
  { id: "w8imy", label: "Form W-8IMY", desc: "Intermediaries / flow-throughs" },
  { id: "w8exp", label: "Form W-8EXP", desc: "Foreign governments / int'l orgs" },
  { id: "w8eci", label: "Form W-8ECI", desc: "Income effectively connected with U.S. trade" },
];

const DOC_TYPES = [
  "Capital Call Notices",
  "Financial Statements & Quarterly Reports",
  "K-1s and Tax Information",
  "Distribution Notices",
  "General Correspondence",
  "Legal Documents",
];

// ============================================================
// STORAGE LAYER
// ============================================================

const STORAGE_KEY_PREFIX = "intake:";

async function loadIntake(token) {
  try {
    const r = await window.storage.get(`${STORAGE_KEY_PREFIX}${token}`);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

async function saveIntake(token, data) {
  try {
    await window.storage.set(`${STORAGE_KEY_PREFIX}${token}`, JSON.stringify(data));
    return true;
  } catch { return false; }
}

async function listAllIntakes() {
  try {
    const r = await window.storage.list(STORAGE_KEY_PREFIX);
    if (!r?.keys) return [];
    const out = [];
    for (const k of r.keys) {
      try {
        const item = await window.storage.get(k);
        if (item) out.push({ key: k, data: JSON.parse(item.value) });
      } catch {}
    }
    return out;
  } catch { return []; }
}

// ============================================================
// SHARED UI
// ============================================================

const styles = {
  fontDisplay: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
};

const cssVars = `
  :root {
    --bg: #f4f1ea;
    --bg-card: #ffffff;
    --ink: #1a1a1a;
    --ink-soft: #4a4a4a;
    --ink-faint: #8a8a8a;
    --rule: #d8d2c4;
    --rule-soft: #e8e3d7;
    --accent: #5a2d1f;
    --accent-soft: #8b4a3a;
    --gold: #b8935a;
    --error: #9b2c2c;
    --ok: #2d5a3d;
  }
  * { box-sizing: border-box; }
  .font-display { font-family: ${styles.fontDisplay}; font-weight: 400; letter-spacing: -0.01em; }
  .font-body { font-family: ${styles.fontBody}; }
  .font-mono { font-family: ${styles.fontMono}; }
  .uppercase-label {
    font-family: ${styles.fontBody};
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 500;
    color: var(--ink-faint);
  }
  input, select, textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--rule);
    background: var(--bg-card);
    font-family: ${styles.fontBody};
    font-size: 14px;
    color: var(--ink);
    border-radius: 2px;
    transition: border-color 0.15s ease;
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent);
  }
  input[type="checkbox"], input[type="radio"] {
    width: auto;
    margin: 0;
  }
  .btn-primary {
    background: var(--ink);
    color: var(--bg);
    border: none;
    padding: 14px 28px;
    font-family: ${styles.fontBody};
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .btn-primary:hover { background: var(--accent); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-ghost {
    background: transparent;
    color: var(--ink);
    border: 1px solid var(--rule);
    padding: 14px 28px;
    font-family: ${styles.fontBody};
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .btn-ghost:hover { border-color: var(--ink); }
  .check-row {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid var(--rule-soft);
    background: var(--bg-card);
    cursor: pointer;
    margin-bottom: 8px;
    transition: all 0.15s ease;
    align-items: flex-start;
  }
  .check-row:hover { border-color: var(--ink-soft); }
  .check-row.selected {
    border-color: var(--accent);
    background: #faf7f0;
  }
  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--rule);
    transition: all 0.2s ease;
  }
  .step-dot.done { background: var(--accent); }
  .step-dot.current { background: var(--ink); transform: scale(1.4); }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.4s ease; }
  .grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    z-index: 1000;
  }
`;

function Label({ children, required }) {
  return (
    <div className="uppercase-label" style={{ marginBottom: 6 }}>
      {children}{required && <span style={{ color: "var(--accent)", marginLeft: 4 }}>*</span>}
    </div>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Label required={required}>{label}</Label>
      {children}
      {hint && <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 4, fontStyle: "italic" }}>{hint}</div>}
    </div>
  );
}

function CheckRow({ checked, onChange, children, type = "checkbox" }) {
  return (
    <label className={`check-row ${checked ? "selected" : ""}`}>
      <input type={type} checked={checked} onChange={onChange} style={{ marginTop: 4 }} />
      <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink)" }}>{children}</span>
    </label>
  );
}

// ============================================================
// GATE
// ============================================================

function Gate({ onUnlock }) {
  const [tok, setTok] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    const t = tok.trim().toUpperCase();
    if (TOKENS[t]) onUnlock(t);
    else setErr("Invalid access code.");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div className="fade-in" style={{
        maxWidth: 460,
        width: "100%",
        background: "var(--bg-card)",
        padding: "56px 48px",
        border: "1px solid var(--rule)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <Lock size={14} color="var(--ink-faint)" />
          <div className="uppercase-label">Private Access</div>
        </div>

        <h1 className="font-display" style={{
          fontSize: 38,
          lineHeight: 1.1,
          margin: "0 0 8px 0",
          color: "var(--ink)",
        }}>
          Prana Global Ventures
        </h1>
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 40, lineHeight: 1.6 }}>
          Limited partner intake. Access by invitation only.
        </div>

        <Field label="Access Code" required>
          <input
            type="text"
            value={tok}
            onChange={(e) => { setTok(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="XXXX-XXXX-XXXX"
            className="font-mono"
            style={{ letterSpacing: "0.05em" }}
            autoFocus
          />
        </Field>

        {err && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            color: "var(--error)", fontSize: 12, marginBottom: 16,
          }}>
            <AlertCircle size={14} /> {err}
          </div>
        )}

        <button className="btn-primary" onClick={submit} style={{ width: "100%", justifyContent: "center" }}>
          Continue <ArrowRight size={14} />
        </button>

        <div style={{
          marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--rule-soft)",
          fontSize: 11, color: "var(--ink-faint)", lineHeight: 1.7,
        }}>
          If you do not have an access code, contact your Prana representative.
          This site does not register accounts and is not publicly indexed.
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}

// ============================================================
// INTAKE FORM
// ============================================================

const emptyData = () => ({
  // Investor identity
  investorName: "",
  investorType: "",
  investorTypeOther: "",
  taxId: "",
  residenceAddress: "",
  mailingAddress: "",
  sameMailing: true,

  // Joint / dual signatory
  jointName: "",
  jointTaxId: "",

  // Capital commitment
  commitment: "",

  // Primary contact
  primaryName: "",
  primaryPhone: "",
  primaryEmail: "",

  // Secondary contacts
  secondaryContacts: [
    { name: "", title: "", company: "", address: "", phone: "", email: "", docTypes: [] },
  ],

  // Wire
  bankName: "",
  bankAddress: "",
  routing: "",
  swift: "",
  accountName: "",
  accountNumber: "",
  furtherCredit: "",

  // Accredited Investor (B-1)
  accredited: [],

  // Qualified Purchaser (B-2)
  qp: [],

  // CFIUS (B-3)
  cfius: [],

  // Benefit Plan (B-4)
  erisa: {},
  erisaPercentage: "",

  // Investment Company Act (entities)
  icaLookThrough: "",
  icaFormedForPurpose: "",

  // Tax form
  taxForm: "",

  // Uploads
  uploads: {
    governmentId: null,
    entityFormation: null,
    taxForm: null,
    other: null,
  },

  // Meta
  status: "in_progress",
  startedAt: new Date().toISOString(),
  lastSaved: null,
});

function Intake({ token, role, label, onExit }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState(emptyData());
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  useEffect(() => {
    (async () => {
      const existing = await loadIntake(token);
      if (existing) {
        setData(existing);
      } else {
        const prefill = TOKENS[token]?.prefill || {};
        setData({ ...emptyData(), ...prefill, investorName: prefill.entityName || "" });
      }
      setLoaded(true);
    })();
  }, [token]);

  // Autosave on data change (debounced)
  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    const t = setTimeout(async () => {
      const ok = await saveIntake(token, { ...data, lastSaved: new Date().toISOString() });
      setSaveState(ok ? "saved" : "error");
      setTimeout(() => setSaveState("idle"), 1500);
    }, 500);
    return () => clearTimeout(t);
  }, [data, loaded, token]);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const toggleArr = (k, id) => setData((d) => ({
    ...d,
    [k]: d[k].includes(id) ? d[k].filter((x) => x !== id) : [...d[k], id],
  }));

  const isEntity = !["Individual (investing individually or married)", "Joint Tenants", ""].includes(data.investorType);

  // ----- Step renderers -----
  const renderInvestor = () => (
    <>
      <SectionHeader title="Investor Information" subtitle="Identity, type, and address as it will appear on the Subscription Agreement signature page." />
      <Field label="Print or Type Name of Investor" required>
        <input value={data.investorName} onChange={(e) => set("investorName", e.target.value)} placeholder="e.g. Jane Doe or Acme Capital Partners LLC" />
      </Field>
      <Field label="Type of Investor" required>
        <select value={data.investorType} onChange={(e) => set("investorType", e.target.value)}>
          <option value="">Select investor type…</option>
          {INVESTOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Field>
      {data.investorType === "Other" && (
        <Field label="Specify"><input value={data.investorTypeOther} onChange={(e) => set("investorTypeOther", e.target.value)} /></Field>
      )}
      <Field label="Social Security or Federal Tax Identification Number" required hint="SSN for individuals, EIN for entities. Stored encrypted.">
        <input value={data.taxId} onChange={(e) => set("taxId", e.target.value)} placeholder="XX-XXXXXXX or XXX-XX-XXXX" className="font-mono" />
      </Field>
      <Field label="Residence or Principal Business Address" required>
        <textarea rows={3} value={data.residenceAddress} onChange={(e) => set("residenceAddress", e.target.value)} placeholder="Street, City, State/Province, Postal Code, Country" />
      </Field>
      <Field label="Mailing Address for Communications">
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, fontSize: 13, color: "var(--ink-soft)" }}>
          <input type="checkbox" checked={data.sameMailing} onChange={(e) => set("sameMailing", e.target.checked)} />
          Same as residence/business address
        </label>
        {!data.sameMailing && <textarea rows={3} value={data.mailingAddress} onChange={(e) => set("mailingAddress", e.target.value)} />}
      </Field>
      {data.investorType === "Joint Tenants" && (
        <div style={{ marginTop: 16, padding: 20, background: "#faf7f0", border: "1px solid var(--rule-soft)" }}>
          <div className="uppercase-label" style={{ marginBottom: 12 }}>Joint Signatory</div>
          <Field label="Print or Type Joint Investor Name" required>
            <input value={data.jointName} onChange={(e) => set("jointName", e.target.value)} />
          </Field>
          <Field label="Social Security No. (joint)">
            <input value={data.jointTaxId} onChange={(e) => set("jointTaxId", e.target.value)} className="font-mono" />
          </Field>
        </div>
      )}
    </>
  );

  const renderCommitment = () => (
    <>
      <SectionHeader title="Capital Commitment" subtitle={`Minimum: $${FUND_INFO.minimumCommitment.toLocaleString()} (GP may accept a lesser amount in its sole discretion). Subject to GP acceptance.`} />
      <Field label="Aggregate Capital Commitment (USD)" required>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-faint)" }}>$</span>
          <input
            type="text"
            value={data.commitment}
            onChange={(e) => set("commitment", e.target.value.replace(/[^0-9,]/g, ""))}
            placeholder="1,000,000"
            style={{ paddingLeft: 28 }}
            className="font-mono"
          />
        </div>
        {data.commitment && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-soft)" }}>
            Numeric: ${parseInt(data.commitment.replace(/,/g, "") || "0", 10).toLocaleString()}
          </div>
        )}
      </Field>
      <div style={{ marginTop: 24, padding: 20, background: "#faf7f0", border: "1px solid var(--rule-soft)", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--ink)" }}>Note on parallel entity.</strong> Under § 6.1(f) of the Amended &amp; Restated Limited Partnership Agreement, the General Partner may form a parallel limited partnership to facilitate Investment Company Act compliance, and may transfer your Interest to such parallel entity if reasonably necessary to maintain an applicable exemption. Your subscription is irrevocable upon acceptance.
      </div>
    </>
  );

  const renderContacts = () => (
    <>
      <SectionHeader title="Primary & Secondary Contacts" subtitle="Primary contact receives all communications by default. Secondary contacts can be designated for specific document types." />
      <div className="uppercase-label" style={{ marginBottom: 12 }}>Primary Contact</div>
      <Field label="Name" required><input value={data.primaryName} onChange={(e) => set("primaryName", e.target.value)} /></Field>
      <Field label="Telephone" required><input value={data.primaryPhone} onChange={(e) => set("primaryPhone", e.target.value)} /></Field>
      <Field label="Email" required><input type="email" value={data.primaryEmail} onChange={(e) => set("primaryEmail", e.target.value)} /></Field>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--rule-soft)" }}>
        <div className="uppercase-label" style={{ marginBottom: 12 }}>Secondary Contacts (Optional)</div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 16, fontStyle: "italic" }}>
          Route specific documents (K-1s, capital calls, etc.) to a different person.
        </div>
        {data.secondaryContacts.map((c, i) => (
          <div key={i} style={{ padding: 20, border: "1px solid var(--rule-soft)", marginBottom: 16, background: "var(--bg-card)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Name"><input value={c.name} onChange={(e) => { const copy = [...data.secondaryContacts]; copy[i].name = e.target.value; set("secondaryContacts", copy); }} /></Field>
              <Field label="Title"><input value={c.title} onChange={(e) => { const copy = [...data.secondaryContacts]; copy[i].title = e.target.value; set("secondaryContacts", copy); }} /></Field>
              <Field label="Company"><input value={c.company} onChange={(e) => { const copy = [...data.secondaryContacts]; copy[i].company = e.target.value; set("secondaryContacts", copy); }} /></Field>
              <Field label="Phone"><input value={c.phone} onChange={(e) => { const copy = [...data.secondaryContacts]; copy[i].phone = e.target.value; set("secondaryContacts", copy); }} /></Field>
            </div>
            <Field label="Email"><input type="email" value={c.email} onChange={(e) => { const copy = [...data.secondaryContacts]; copy[i].email = e.target.value; set("secondaryContacts", copy); }} /></Field>
            <Field label="Address"><textarea rows={2} value={c.address} onChange={(e) => { const copy = [...data.secondaryContacts]; copy[i].address = e.target.value; set("secondaryContacts", copy); }} /></Field>
            <Label>Route these documents to this contact</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
              {DOC_TYPES.map((d) => (
                <label key={d} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-soft)", padding: "4px 0" }}>
                  <input type="checkbox" checked={c.docTypes.includes(d)} onChange={() => {
                    const copy = [...data.secondaryContacts];
                    copy[i].docTypes = copy[i].docTypes.includes(d) ? copy[i].docTypes.filter((x) => x !== d) : [...copy[i].docTypes, d];
                    set("secondaryContacts", copy);
                  }} />
                  {d}
                </label>
              ))}
            </div>
            {data.secondaryContacts.length > 1 && (
              <button className="btn-ghost" style={{ marginTop: 12, padding: "8px 16px", fontSize: 11 }}
                onClick={() => set("secondaryContacts", data.secondaryContacts.filter((_, j) => j !== i))}>
                Remove Contact
              </button>
            )}
          </div>
        ))}
        <button className="btn-ghost" onClick={() => set("secondaryContacts", [...data.secondaryContacts, { name: "", title: "", company: "", address: "", phone: "", email: "", docTypes: [] }])}>
          + Add Another Contact
        </button>
      </div>
    </>
  );

  const renderWire = () => (
    <>
      <SectionHeader title="Distribution Instructions" subtitle="Wire details for capital calls and distributions. All fields will be verified against your tax documentation." />
      <Field label="Bank Name" required><input value={data.bankName} onChange={(e) => set("bankName", e.target.value)} /></Field>
      <Field label="Bank Address" required><textarea rows={2} value={data.bankAddress} onChange={(e) => set("bankAddress", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Routing & Transit No." hint="ABA / RTN for US banks">
          <input value={data.routing} onChange={(e) => set("routing", e.target.value)} className="font-mono" />
        </Field>
        <Field label="SWIFT / BIC" hint="For international wires">
          <input value={data.swift} onChange={(e) => set("swift", e.target.value)} className="font-mono" />
        </Field>
      </div>
      <Field label="Account Name" required><input value={data.accountName} onChange={(e) => set("accountName", e.target.value)} /></Field>
      <Field label="Account Number" required><input value={data.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} className="font-mono" /></Field>
      <Field label="For Further Credit (if applicable)"><input value={data.furtherCredit} onChange={(e) => set("furtherCredit", e.target.value)} /></Field>
    </>
  );

  const renderAccredited = () => (
    <>
      <SectionHeader title="Exhibit B-1 — Accredited Investor Status" subtitle="Select every category that applies to the Investor. Rule 501, Regulation D, Securities Act of 1933." />
      <div style={{ marginBottom: 16 }}>
        {ACCREDITED_CATEGORIES.map((c) => (
          <CheckRow key={c.id} checked={data.accredited.includes(c.id)} onChange={() => toggleArr("accredited", c.id)}>
            <span><strong style={{ color: "var(--accent)", marginRight: 8 }}>{c.id.replace("ai_", "")}.</strong>{c.label}</span>
          </CheckRow>
        ))}
      </div>
    </>
  );

  const renderQP = () => (
    <>
      <SectionHeader title="Exhibit B-2 — Qualified Purchaser Representations" subtitle={`§ 2(a)(51)(A) of the Investment Company Act. The Fund is currently being offered under the § 3(c)(1) exemption (accredited investor status alone qualifies). The General Partner may form a parallel entity under § 6.1(f) of the LPA if needed to maintain exemption; in that event, QP status may become relevant. Please complete if applicable — leave blank if not.`} />
      {QP_CATEGORIES.map((c) => (
        <CheckRow key={c.id} checked={data.qp.includes(c.id)} onChange={() => toggleArr("qp", c.id)}>
          <span><strong style={{ color: "var(--accent)", marginRight: 8 }}>{c.id.replace("qp_", "")}.</strong>{c.label}</span>
        </CheckRow>
      ))}
    </>
  );

  const renderCFIUS = () => (
    <>
      <SectionHeader title="Exhibit B-3 — CFIUS Foreign Person Status" subtitle="§ 721 of the Defense Production Act. Select all that apply." />
      {CFIUS_CATEGORIES.map((c) => (
        <CheckRow key={c.id} checked={data.cfius.includes(c.id)} onChange={() => toggleArr("cfius", c.id)}>
          <span><strong style={{ color: "var(--accent)", marginRight: 8 }}>{c.id.replace("cf_", "")}.</strong>{c.label}</span>
        </CheckRow>
      ))}
    </>
  );

  const renderERISA = () => (
    <>
      <SectionHeader title="Exhibit B-4 — Employee Benefit Plan Investor" subtitle="Indicate True or False for each statement." />
      {ERISA_QUESTIONS.map((q) => (
        <div key={q.id} style={{ padding: 16, border: "1px solid var(--rule-soft)", marginBottom: 10, background: "var(--bg-card)" }}>
          <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{q.label}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["True", "False"].map((v) => (
              <button key={v}
                onClick={() => set("erisa", { ...data.erisa, [q.id]: v })}
                style={{
                  padding: "8px 20px",
                  border: "1px solid",
                  borderColor: data.erisa[q.id] === v ? "var(--accent)" : "var(--rule)",
                  background: data.erisa[q.id] === v ? "#faf7f0" : "var(--bg-card)",
                  color: data.erisa[q.id] === v ? "var(--accent)" : "var(--ink-soft)",
                  fontFamily: styles.fontBody,
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  cursor: "pointer",
                }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
      {data.erisa.erisa_d === "True" && (
        <Field label="Maximum expected % of Investor's capital commitment from plan-asset entities" hint="If left blank, GP will treat as 100%.">
          <input value={data.erisaPercentage} onChange={(e) => set("erisaPercentage", e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 25" style={{ width: 120 }} className="font-mono" />
        </Field>
      )}
    </>
  );

  const renderTax = () => (
    <>
      <SectionHeader title="Withholding Certificate" subtitle="Select the form that applies. You will upload a signed copy in the next step." />
      {TAX_FORMS.map((f) => (
        <CheckRow key={f.id} type="radio" checked={data.taxForm === f.id} onChange={() => set("taxForm", f.id)}>
          <span><strong style={{ marginRight: 10 }}>{f.label}</strong><span style={{ color: "var(--ink-faint)" }}>— {f.desc}</span></span>
        </CheckRow>
      ))}
    </>
  );

  const renderUploads = () => (
    <>
      <SectionHeader title="Supporting Documentation" subtitle="Upload identification, formation documents, and your executed tax form. All files are stored encrypted and visible only to Prana's GP and counsel." />
      <UploadField label="Government-issued ID (Passport or Driver's License)" required value={data.uploads.governmentId} onChange={(v) => set("uploads", { ...data.uploads, governmentId: v })} />
      {isEntity && (
        <UploadField label="Entity Formation Documents (Certificate of Incorporation, LLC Agreement, Trust Deed, etc.)" required value={data.uploads.entityFormation} onChange={(v) => set("uploads", { ...data.uploads, entityFormation: v })} />
      )}
      <UploadField label={`Executed ${TAX_FORMS.find((f) => f.id === data.taxForm)?.label || "Withholding Certificate"}`} required value={data.uploads.taxForm} onChange={(v) => set("uploads", { ...data.uploads, taxForm: v })} />
      <UploadField label="Other Supporting Documents (Optional)" value={data.uploads.other} onChange={(v) => set("uploads", { ...data.uploads, other: v })} />
    </>
  );

  const renderReview = () => (
    <>
      <SectionHeader title="Review & Submit" subtitle="Verify your responses. Submission notifies Prana and DLA Piper. You may return and amend until the Fund accepts your subscription." />
      <ReviewBlock title="Investor" items={[
        ["Name", data.investorName],
        ["Type", data.investorType + (data.investorTypeOther ? ` (${data.investorTypeOther})` : "")],
        ["Tax ID", data.taxId ? "•••••" + data.taxId.slice(-4) : "—"],
        ["Address", data.residenceAddress],
      ]} />
      <ReviewBlock title="Commitment" items={[
        ["Amount (USD)", data.commitment ? `$${parseInt(data.commitment.replace(/,/g, "") || "0", 10).toLocaleString()}` : "—"],
      ]} />
      <ReviewBlock title="Primary Contact" items={[
        ["Name", data.primaryName],
        ["Phone", data.primaryPhone],
        ["Email", data.primaryEmail],
      ]} />
      <ReviewBlock title="Wire" items={[
        ["Bank", data.bankName],
        ["Account Name", data.accountName],
        ["Account No.", data.accountNumber ? "•••••" + data.accountNumber.slice(-4) : "—"],
      ]} />
      <ReviewBlock title="Status" items={[
        ["Accredited Categories", data.accredited.length],
        ["Qualified Purchaser", data.qp.length],
        ["CFIUS", data.cfius.length],
        ["Tax Form", TAX_FORMS.find((f) => f.id === data.taxForm)?.label || "—"],
      ]} />

      <div style={{ marginTop: 32, padding: 24, background: "#faf7f0", border: "1px solid var(--rule)" }}>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-soft)" }}>
          By submitting, you authorize Prana Global Ventures and its counsel (DLA Piper LLP) to use the foregoing information to populate your Subscription Agreement and related exhibits. You will receive a draft for signature within 2 business days.
        </div>
      </div>

      <button className="btn-primary" style={{ marginTop: 24, width: "100%", justifyContent: "center", padding: "18px 28px" }}
        onClick={async () => {
          await saveIntake(token, { ...data, status: "submitted", submittedAt: new Date().toISOString() });
          set("status", "submitted");
        }}>
        {data.status === "submitted" ? <><Check size={14} /> Submitted</> : <>Submit Intake <ArrowRight size={14} /></>}
      </button>
    </>
  );

  const renderers = {
    investor: renderInvestor,
    commitment: renderCommitment,
    contacts: renderContacts,
    wire: renderWire,
    accredited: renderAccredited,
    qualified: renderQP,
    cfius: renderCFIUS,
    erisa: renderERISA,
    tax: renderTax,
    uploads: renderUploads,
    review: renderReview,
  };

  if (!loaded) return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)" }}>Loading…</div>;

  const currentStep = STEPS[stepIdx];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 0 80px 0" }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div className="uppercase-label" style={{ marginBottom: 6 }}>Prana Global Ventures · Limited Partner Intake</div>
            <h1 className="font-display" style={{ fontSize: 30, margin: 0, color: "var(--ink)" }}>{label}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <SaveIndicator state={saveState} />
            <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 10 }} onClick={onExit}>Exit</button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 48 }}>
        {/* Stepper */}
        <div>
          <div className="uppercase-label" style={{ marginBottom: 16 }}>Progress</div>
          <div>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isCurrent = i === stepIdx;
              const isDone = i < stepIdx;
              return (
                <button key={s.id}
                  onClick={() => setStepIdx(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "10px 0", border: "none", background: "transparent",
                    cursor: "pointer", textAlign: "left",
                    color: isCurrent ? "var(--ink)" : isDone ? "var(--ink-soft)" : "var(--ink-faint)",
                  }}>
                  <span className={`step-dot ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`} />
                  <Icon size={14} />
                  <span style={{
                    fontSize: 13,
                    fontWeight: isCurrent ? 600 : 400,
                    fontFamily: styles.fontBody,
                  }}>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="fade-in" key={currentStep.id} style={{
          background: "var(--bg-card)",
          padding: "48px 56px",
          border: "1px solid var(--rule)",
          minHeight: 600,
        }}>
          {renderers[currentStep.id]()}

          {/* Navigation */}
          <div style={{
            marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--rule-soft)",
            display: "flex", justifyContent: "space-between", gap: 12,
          }}>
            <button className="btn-ghost" onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}>
              <ArrowLeft size={14} /> Back
            </button>
            {stepIdx < STEPS.length - 1 && (
              <button className="btn-primary" onClick={() => setStepIdx(Math.min(STEPS.length - 1, stepIdx + 1))}>
                Continue <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="grain" />
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 className="font-display" style={{ fontSize: 32, margin: "0 0 8px 0", color: "var(--ink)", lineHeight: 1.1 }}>{title}</h2>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 580 }}>{subtitle}</div>
      <div style={{ height: 1, background: "var(--rule)", margin: "20px 0 32px 0" }} />
    </div>
  );
}

function SaveIndicator({ state }) {
  if (state === "idle") return null;
  const map = {
    saving: { text: "Saving…", color: "var(--ink-faint)" },
    saved: { text: "✓ Saved", color: "var(--ok)" },
    error: { text: "⚠ Save failed", color: "var(--error)" },
  };
  const m = map[state];
  return <span style={{ fontSize: 11, color: m.color, fontFamily: styles.fontMono, letterSpacing: "0.05em" }}>{m.text}</span>;
}

function UploadField({ label, value, onChange, required }) {
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange({ name: f.name, size: f.size, type: f.type, uploadedAt: new Date().toISOString() });
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <Label required={required}>{label}</Label>
      <div style={{
        border: "1px dashed var(--rule)",
        padding: 20,
        background: value ? "#faf7f0" : "var(--bg-card)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        {value ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink)" }}>
            <FileText size={16} color="var(--accent)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{value.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{(value.size / 1024).toFixed(1)} KB · {new Date(value.uploadedAt).toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>No file selected</div>
        )}
        <label className="btn-ghost" style={{ padding: "8px 16px", fontSize: 11, cursor: "pointer" }}>
          <Upload size={12} /> {value ? "Replace" : "Upload"}
          <input type="file" onChange={handleFile} style={{ display: "none" }} />
        </label>
      </div>
    </div>
  );
}

function ReviewBlock({ title, items }) {
  return (
    <div style={{ marginBottom: 20, padding: 20, background: "var(--bg-card)", border: "1px solid var(--rule-soft)" }}>
      <div className="uppercase-label" style={{ marginBottom: 12 }}>{title}</div>
      {items.map(([k, v], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < items.length - 1 ? "1px solid var(--rule-soft)" : "none", gap: 16 }}>
          <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{k}</span>
          <span style={{ fontSize: 13, color: "var(--ink)", textAlign: "right", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v || "—"}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================

function Admin({ onExit }) {
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const list = await listAllIntakes();
      setIntakes(list);
      setLoading(false);
    })();
  }, []);

  const totals = useMemo(() => {
    const submitted = intakes.filter((i) => i.data.status === "submitted").length;
    const inProgress = intakes.filter((i) => i.data.status === "in_progress").length;
    const totalCommitted = intakes
      .filter((i) => i.data.status === "submitted")
      .reduce((sum, i) => sum + (parseInt((i.data.commitment || "0").replace(/,/g, ""), 10) || 0), 0);
    return { submitted, inProgress, totalCommitted };
  }, [intakes]);

  if (loading) return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div className="uppercase-label" style={{ marginBottom: 6 }}>Prana Global Ventures · GP Console</div>
            <h1 className="font-display" style={{ fontSize: 36, margin: 0 }}>LP Intake Dashboard</h1>
          </div>
          <button className="btn-ghost" onClick={onExit}>Exit</button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          <StatCard label="Submitted" value={totals.submitted} sublabel="Intakes complete" />
          <StatCard label="In Progress" value={totals.inProgress} sublabel="Awaiting submission" />
          <StatCard label="Total Committed" value={`$${totals.totalCommitted.toLocaleString()}`} sublabel="From submitted intakes" />
        </div>

        {/* Table */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--rule)", padding: 32 }}>
          <div className="uppercase-label" style={{ marginBottom: 16 }}>All Intakes ({intakes.length})</div>
          {intakes.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-faint)", fontSize: 14 }}>
              No intakes started yet. Generate a token and share with prospective LPs.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--ink-faint)", borderBottom: "1px solid var(--rule)" }}>
                  <th style={{ padding: "12px 8px", fontWeight: 500, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Token</th>
                  <th style={{ padding: "12px 8px", fontWeight: 500, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Investor</th>
                  <th style={{ padding: "12px 8px", fontWeight: 500, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Commitment</th>
                  <th style={{ padding: "12px 8px", fontWeight: 500, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 8px", fontWeight: 500, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Last Saved</th>
                  <th style={{ padding: "12px 8px" }}></th>
                </tr>
              </thead>
              <tbody>
                {intakes.map((i) => {
                  const token = i.key.replace(STORAGE_KEY_PREFIX, "");
                  const d = i.data;
                  return (
                    <tr key={i.key} style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                      <td style={{ padding: "14px 8px", fontFamily: styles.fontMono, fontSize: 12 }}>{token}</td>
                      <td style={{ padding: "14px 8px" }}>{d.investorName || <span style={{ color: "var(--ink-faint)" }}>—</span>}</td>
                      <td style={{ padding: "14px 8px", fontFamily: styles.fontMono, fontSize: 12 }}>
                        {d.commitment ? `$${parseInt(d.commitment.replace(/,/g, "") || "0", 10).toLocaleString()}` : "—"}
                      </td>
                      <td style={{ padding: "14px 8px" }}>
                        <StatusPill status={d.status} />
                      </td>
                      <td style={{ padding: "14px 8px", color: "var(--ink-faint)", fontSize: 12 }}>
                        {d.lastSaved ? new Date(d.lastSaved).toLocaleString() : "—"}
                      </td>
                      <td style={{ padding: "14px 8px", textAlign: "right" }}>
                        <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 10 }} onClick={() => setSelected(i)}>
                          <Eye size={11} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && <DetailDrawer intake={selected} onClose={() => setSelected(null)} />}
      <div className="grain" />
    </div>
  );
}

function StatCard({ label, value, sublabel }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--rule)", padding: 24 }}>
      <div className="uppercase-label" style={{ marginBottom: 12 }}>{label}</div>
      <div className="font-display" style={{ fontSize: 36, color: "var(--ink)", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{sublabel}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    submitted: { bg: "#e8efe8", color: "var(--ok)", label: "Submitted" },
    in_progress: { bg: "#fbf3e6", color: "#7c5a1e", label: "In Progress" },
  };
  const m = map[status] || map.in_progress;
  return (
    <span style={{
      padding: "3px 10px", fontSize: 10, fontWeight: 500,
      letterSpacing: "0.1em", textTransform: "uppercase",
      background: m.bg, color: m.color, borderRadius: 2,
    }}>{m.label}</span>
  );
}

function DetailDrawer({ intake, onClose }) {
  const d = intake.data;
  const token = intake.key.replace(STORAGE_KEY_PREFIX, "");

  const exportJSON = () => {
    const blob = JSON.stringify(d, null, 2);
    navigator.clipboard?.writeText(blob);
    alert("JSON copied to clipboard. Paste into your doc-merge pipeline.");
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,26,26,0.4)",
      display: "flex", justifyContent: "flex-end", zIndex: 100,
    }} onClick={onClose}>
      <div style={{ width: 540, height: "100%", background: "var(--bg)", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 32, borderBottom: "1px solid var(--rule)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div className="uppercase-label">Intake Detail · {token}</div>
            <button onClick={onClose} style={{ border: "none", background: "transparent", color: "var(--ink-faint)", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>
          <h2 className="font-display" style={{ fontSize: 26, margin: "8px 0 0 0" }}>{d.investorName || "Untitled"}</h2>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 10 }} onClick={exportJSON}>
              <Copy size={11} /> Copy JSON
            </button>
            <button className="btn-ghost" style={{ padding: "8px 14px", fontSize: 10 }} onClick={() => {
              const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `intake-${token}.json`; a.click();
            }}>
              <Download size={11} /> Download
            </button>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          <DetailSection title="Investor">
            <DetailRow label="Name" value={d.investorName} />
            <DetailRow label="Type" value={d.investorType} />
            <DetailRow label="Tax ID" value={d.taxId} />
            <DetailRow label="Address" value={d.residenceAddress} />
          </DetailSection>

          <DetailSection title="Commitment">
            <DetailRow label="Amount" value={d.commitment ? `$${parseInt(d.commitment.replace(/,/g, "") || "0", 10).toLocaleString()}` : "—"} />
          </DetailSection>

          <DetailSection title="Primary Contact">
            <DetailRow label="Name" value={d.primaryName} />
            <DetailRow label="Phone" value={d.primaryPhone} />
            <DetailRow label="Email" value={d.primaryEmail} />
          </DetailSection>

          <DetailSection title="Wire">
            <DetailRow label="Bank" value={d.bankName} />
            <DetailRow label="Account Name" value={d.accountName} />
            <DetailRow label="Account #" value={d.accountNumber} />
            <DetailRow label="Routing" value={d.routing} />
            <DetailRow label="SWIFT" value={d.swift} />
          </DetailSection>

          <DetailSection title="Accredited Investor (B-1)">
            {d.accredited.length === 0 ? <div style={{ color: "var(--ink-faint)", fontSize: 13 }}>None selected</div> :
              d.accredited.map((id) => (
                <div key={id} style={{ fontSize: 12, color: "var(--ink-soft)", padding: "4px 0", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--accent)" }}>{id.replace("ai_", "")}.</strong> {ACCREDITED_CATEGORIES.find((c) => c.id === id)?.label}
                </div>
              ))}
          </DetailSection>

          <DetailSection title="Qualified Purchaser (B-2)">
            {d.qp.length === 0 ? <div style={{ color: "var(--ink-faint)", fontSize: 13 }}>None selected</div> :
              d.qp.map((id) => (
                <div key={id} style={{ fontSize: 12, color: "var(--ink-soft)", padding: "4px 0", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--accent)" }}>{id.replace("qp_", "")}.</strong> {QP_CATEGORIES.find((c) => c.id === id)?.label}
                </div>
              ))}
          </DetailSection>

          <DetailSection title="Tax Form">
            <DetailRow label="Form" value={TAX_FORMS.find((f) => f.id === d.taxForm)?.label || "—"} />
          </DetailSection>

          <DetailSection title="Uploads">
            {Object.entries(d.uploads || {}).map(([k, v]) => (
              <DetailRow key={k} label={k} value={v?.name || "—"} />
            ))}
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--rule-soft)" }}>
      <div className="uppercase-label" style={{ marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", gap: 16 }}>
      <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--ink)", textAlign: "right", maxWidth: 320, wordBreak: "break-word" }}>{value || "—"}</span>
    </div>
  );
}

// ============================================================
// ROOT
// ============================================================

export default function App() {
  const [session, setSession] = useState(null); // { token, role, label }

  const unlock = (token) => {
    const meta = TOKENS[token];
    setSession({ token, role: meta.role, label: meta.label });
  };

  const exit = () => setSession(null);

  return (
    <>
      <style>{cssVars}</style>
      <div className="font-body" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
        {!session && <Gate onUnlock={unlock} />}
        {session?.role === "admin" && <Admin onExit={exit} />}
        {session?.role === "investor" && <Intake token={session.token} role={session.role} label={session.label} onExit={exit} />}
      </div>
    </>
  );
}
