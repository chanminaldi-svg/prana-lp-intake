"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Shield, Upload, User, Globe2 } from "lucide-react";

const FUND_INFO = {
  name: "Prana Global Ventures",
  fund: "Prana Global Ventures, LP",
  closing: "May 31, 2026",
  minimumCommitment: "$1,000,000",
};

const INTAKE_EMAIL = "chan.minaldi@gmail.com";
const GEO_TOKEN_PREFIXES = {
  "US-": "North America",
  "EMEA-": "EMEA",
  "APAC-": "Asia Pacific",
  "LATAM-": "Latin America",
};

function parseTokenRegion(tokenCode) {
  if (!tokenCode) return null;
  const normalized = tokenCode.trim().toUpperCase();
  for (const prefix in GEO_TOKEN_PREFIXES) {
    if (normalized.startsWith(prefix)) {
      return GEO_TOKEN_PREFIXES[prefix];
    }
  }
  return null;
}

export default function HomePage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    entityName: "",
    phone: "",
    country: "",
    amount: "",
    tokenCode: "",
    notes: "",
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => form.fullName && form.email && form.entityName && form.amount,
    [form]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const submission = {
      ...form,
      region: parseTokenRegion(form.tokenCode) ?? undefined,
    };

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Submission failed.");
      }

      setStatus({ type: "success", message: "Your intake request was submitted successfully." });
      setForm({ fullName: "", email: "", entityName: "", phone: "", country: "", amount: "", tokenCode: "", notes: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Private LP Intake</p>
          <h1>{FUND_INFO.name}</h1>
          <p className="summary">
            A secure public intake form for prospective LPs to submit their SPV readiness information.
          </p>
        </div>
        <div className="hero-stats">
          <div>
            <strong>{FUND_INFO.fund}</strong>
            <span>Active closing: {FUND_INFO.closing}</span>
          </div>
          <div>
            <strong>{FUND_INFO.minimumCommitment}</strong>
            <span>Minimum commitment</span>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="content-card">
          <div className="card-head">
            <Shield size={20} />
            <h2>Token-gated entry</h2>
          </div>
          <p>
            Enter a private access code if you have one. If you do not have a code, leave it blank and submit your interest directly.
          </p>
          <div className="feature-list">
            <div>
              <CheckCircle2 size={18} />
              <span>Private access option</span>
            </div>
            <div>
              <Mail size={18} />
              <span>Email confirmation and follow-up from GP.</span>
            </div>
            <div>
              <Globe2 size={18} />
              <span>Publicly available landing page for investor outreach.</span>
            </div>
          </div>
        </article>

        <article className="content-card intake-form-card">
          <form onSubmit={handleSubmit} className="intake-form">
            <div className="form-row">
              <label>
                <span>Full name</span>
                <div className="input-with-icon">
                  <User size={16} />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                    placeholder="Investor or authorized signer"
                    required
                  />
                </div>
              </label>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="name@domain.com"
                  required
                />
              </label>
            </div>

            <label>
              <span>Entity / family office name</span>
              <input
                type="text"
                value={form.entityName}
                onChange={(event) => setForm({ ...form, entityName: event.target.value })}
                placeholder="Entity name"
                required
              />
            </label>

            <div className="form-row">
              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  placeholder="(555) 555-5555"
                />
              </label>
              <label>
                <span>Country</span>
                <input
                  type="text"
                  value={form.country}
                  onChange={(event) => setForm({ ...form, country: event.target.value })}
                  placeholder="United States"
                />
              </label>
            </div>

            <label>
              <span>Target commitment amount</span>
              <input
                type="text"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="$1,000,000"
                required
              />
            </label>

            <label>
              <span>Access code (optional)</span>
              <input
                type="text"
                value={form.tokenCode}
                onChange={(event) => setForm({ ...form, tokenCode: event.target.value })}
                placeholder="US-INVESTOR, EMEA-INVESTOR, APAC-INVESTOR"
              />
              <p className="field-hint">
                Use a geography token prefix if available: US-, EMEA-, APAC-, LATAM-.
              </p>
            </label>

            <label>
              <span>Any notes for the GP team</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="LP background, structure, or timing"
                rows={4}
              />
            </label>

            <div className="submit-row">
              <button type="submit" disabled={!canSubmit || submitting}>
                {submitting ? "Submitting..." : "Submit intake request"}
                <ArrowRight size={18} />
              </button>
              <p className="hint">
                After submitting, send required documents to <strong>{INTAKE_EMAIL}</strong>.
              </p>
            </div>

            {status && (
              <div className={`status-message ${status.type}`}>{status.message}</div>
            )}
          </form>
        </article>
      </section>
    </main>
  );
}
