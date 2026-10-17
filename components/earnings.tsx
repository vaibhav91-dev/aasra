"use client";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
  Wallet,
  Plus,
  Sparkles,
  FileText,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import {
  categories,
  displayDate,
  indiaToday,
  money,
  parseAmount,
  validEntry,
  type Entry,
  type EntryType,
  type EarningsSummary,
} from "@/lib/earnings";
import type { Language, Strings } from "@/lib/i18n";
export function SummaryCards({
  summary,
  language,
  t,
}: {
  summary: EarningsSummary;
  language: Language;
  t: Strings;
}) {
  return (
    <div className="summary-grid">
      {(
        [
          ["income", summary.incomePaise, ArrowDownLeft],
          ["expense", summary.expensePaise, ArrowUpRight],
          ["net", summary.netPaise, Wallet],
        ] as const
      ).map(([key, value, Icon]) => (
        <div key={key} className={"summary-card " + key}>
          <div className="summary-label">
            <span>{t[key]}</span>
            <Icon size={18} />
          </div>
          <strong>{money(value, language)}</strong>
          <span className="summary-caption">{t.recorded}</span>
        </div>
      ))}
    </div>
  );
}
export function Entries({
  entries,
  language,
  t,
  onEdit,
  onDelete,
}: {
  entries: Entry[];
  language: Language;
  t: Strings;
  onEdit?: (e: Entry) => void;
  onDelete?: (e: Entry) => void;
}) {
  return (
    <div className="entries">
      {entries.map((e) => (
        <div className="entry" key={e.id}>
          <span className={"entry-symbol " + e.type}>
            {e.type === "income" ? (
              <ArrowDownLeft size={18} />
            ) : (
              <ArrowUpRight size={18} />
            )}
          </span>
          <div className="entry-info">
            <strong>{t[e.category]}</strong>
            <span>
              {displayDate(e.date, language)} ·{" "}
              {e.type === "income" ? t.income : t.expense}
            </span>
          </div>
          <strong className="entry-amount">
            {e.type === "expense" ? "−" : "+"}
            {money(e.amountPaise, language)}
          </strong>
          {onEdit && (
            <button
              className="icon-button"
              aria-label={`${t.edit} ${t[e.category]} ${money(e.amountPaise, language)}`}
              onClick={() => onEdit(e)}
            >
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button
              className="icon-button"
              aria-label={`${t.remove} ${t[e.category]} ${money(e.amountPaise, language)}`}
              onClick={() => onDelete(e)}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
export function Dashboard({
  entries,
  summary,
  language,
  t,
  navigate,
  onExplain,
}: {
  entries: Entry[];
  summary: EarningsSummary;
  language: Language;
  t: Strings;
  navigate: (s: "earnings" | "chat" | "documents" | "grievance") => void;
  onExplain: () => void;
}) {
  const maximum = Math.max(
    1,
    ...summary.days.flatMap((d) => [d.incomePaise, d.expensePaise]),
  );
  return (
    <div className="stack">
      <div className="section-heading">
        <div>
          <h2>{t.week}</h2>
          <span className="muted">
            {displayDate(summary.from, language)} —{" "}
            {displayDate(summary.to, language)}
          </span>
        </div>
        <button className="button" onClick={() => navigate("earnings")}>
          <Plus size={17} />
          {t.add}
        </button>
      </div>
      <SummaryCards summary={summary} language={language} t={t} />
      <div className="dashboard-columns">
        <section className="card">
          <div className="section-heading">
            <h2>{t.activity}</h2>
            <span className="pill">INR ₹</span>
          </div>
          <div className="chart-legend">
            <span>● {t.income}</span>
            <span>▧ {t.expense}</span>
          </div>
          <div className="chart" aria-hidden="true">
            {summary.days.map((d) => (
              <div className="chart-day" key={d.date}>
                <div className="chart-bars">
                  <span
                    className="bar income-bar"
                    style={{ height: `${(d.incomePaise / maximum) * 100}%` }}
                  />
                  <span
                    className="bar expense-bar"
                    style={{ height: `${(d.expensePaise / maximum) * 100}%` }}
                  />
                </div>
                <span>{displayDate(d.date, language)}</span>
              </div>
            ))}
          </div>
          <details className="chart-data">
            <summary>{t.sevenDays}</summary>
            <ul>
              {summary.days.map((d) => (
                <li key={d.date}>
                  {displayDate(d.date, language)}: {t.income}{" "}
                  {money(d.incomePaise, language)}, {t.expense}{" "}
                  {money(d.expensePaise, language)}, {t.net}{" "}
                  {money(d.netPaise, language)}
                </li>
              ))}
            </ul>
          </details>
          <button className="button ghost" onClick={onExplain}>
            <Sparkles size={16} />
            {t.explain}
            <ArrowUpRight size={15} />
          </button>
        </section>
        <section className="saathi-card">
          <div className="saathi-art" aria-hidden="true">
            <div className="sun" />
            <div className="art-road" />
            <ShieldCheck size={68} strokeWidth={1} />
            <span className="art-star">✳</span>
          </div>
          <span className="eyebrow">{t.tagline}</span>
          <h2>{t.start}</h2>
          <p>{t.chatIntro}</p>
          <button className="button" onClick={() => navigate("chat")}>
            {t.ask}
            <ArrowUpRight size={17} />
          </button>
        </section>
      </div>
      <section>
        <div className="section-heading">
          <h2>{t.actions}</h2>
          <span className="eyebrow">{t.quick}</span>
        </div>
        <div className="quick-grid">
          {(
            [
              ["chat", Sparkles, t.ask, t.chatIntro],
              ["documents", FileText, t.document, t.docIntro],
              ["grievance", MessageSquareText, t.draft, t.grievanceIntro],
            ] as const
          ).map(([s, Icon, title, hint]) => (
            <button key={s} className="quick-card" onClick={() => navigate(s)}>
              <span className={"quick-icon " + s}>
                <Icon size={21} />
              </span>
              <strong>{title}</strong>
              <p>{hint}</p>
              <ArrowUpRight className="quick-arrow" size={17} />
            </button>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="section-heading">
          <h2>{t.recent}</h2>
          <button className="button ghost" onClick={() => navigate("earnings")}>
            {t.all}
            <ArrowUpRight size={15} />
          </button>
        </div>
        {entries.length ? (
          <Entries
            entries={[...entries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 4)}
            language={language}
            t={t}
          />
        ) : (
          <div className="empty">
            <div className="empty-icon">
              <Wallet size={25} />
            </div>
            <h3>{t.empty}</h3>
            <p>
              {t.emptyHint} {t.zeroHint}
            </p>
            <button
              className="button secondary"
              onClick={() => navigate("earnings")}
            >
              <Plus size={17} />
              {t.add}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
export function Earnings({
  entries,
  summary,
  language,
  t,
  onSave,
  onDelete,
  onExplain,
  onConcern,
}: {
  entries: Entry[];
  summary: EarningsSummary;
  language: Language;
  t: Strings;
  onSave: (e: Entry) => boolean | Promise<boolean>;
  onDelete: (e: Entry) => void;
  onExplain: () => void;
  onConcern: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null),
    [type, setType] = useState<EntryType>("income"),
    [amount, setAmount] = useState(""),
    [date, setDate] = useState(indiaToday),
    [category, setCategory] = useState<string>("delivery"),
    [error, setError] = useState(false),
    [saving, setSaving] = useState(false);
  function reset() {
    setEditing(null);
    setAmount("");
    setError(false);
  }
  return (
    <div className="stack">
      <div>
        <h2>{t.week}</h2>
        <SummaryCards summary={summary} language={language} t={t} />
      </div>
      <section className="card">
        <h2>{editing ? t.edit : t.add}</h2>
        <form
          className="form-grid"
          onSubmit={async (e) => {
            e.preventDefault();
            if (saving) return;
            const amountPaise = parseAmount(amount);
            const entry = {
              id: editing ?? crypto.randomUUID(),
              type,
              amountPaise,
              date,
              category,
            };
            if (!validEntry(entry)) {
              setError(true);
              return;
            }
            setSaving(true);
            try {
              if (await onSave(entry)) reset();
            } finally {
              setSaving(false);
            }
          }}
        >
          <label className="field">
            {t.type}
            <select
              value={type}
              onChange={(e) => {
                const next = e.target.value as EntryType;
                setType(next);
                setCategory(categories[next][0]);
              }}
            >
              <option value="income">{t.income}</option>
              <option value="expense">{t.expense}</option>
            </select>
          </label>
          <label className="field">
            {t.amount}
            <input
              aria-describedby={error ? "entry-error" : undefined}
              aria-invalid={error}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              maxLength={10}
            />
          </label>
          <label className="field">
            {t.date}
            <input
              type="date"
              value={date}
              min="1900-01-01"
              max={indiaToday()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label className="field">
            {t.category}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories[type].map((c) => (
                <option value={c} key={c}>
                  {t[c]}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p id="entry-error" className="notice error full" role="alert">
              {t.invalid}
            </p>
          )}
          <div className="button-row full">
            <button className="button" type="submit" disabled={saving}>
              {t.save}
            </button>
            {editing && (
              <button
                type="button"
                className="button secondary"
                onClick={reset}
              >
                {t.cancel}
              </button>
            )}
          </div>
        </form>
      </section>
      <div className="button-row">
        <button className="button secondary" onClick={onExplain}>
          <Sparkles size={17} />
          {t.explain}
        </button>
        <button className="button ghost" onClick={onConcern}>
          {t.paymentConcern}
          <ArrowUpRight size={16} />
        </button>
      </div>
      <p className="muted">{t.concernHint}</p>
      <section className="card">
        <h2>
          {t.all} <span className="pill">{entries.length}</span>
        </h2>
        {entries.length ? (
          <Entries
            entries={[...entries].sort((a, b) => b.date.localeCompare(a.date))}
            t={t}
            language={language}
            onEdit={(e) => {
              setEditing(e.id);
              setType(e.type);
              setAmount((e.amountPaise / 100).toFixed(2));
              setDate(e.date);
              setCategory(e.category);
              setError(false);
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
            onDelete={onDelete}
          />
        ) : (
          <div className="empty">
            <h3>{t.empty}</h3>
            <p>{t.emptyHint}</p>
          </div>
        )}
      </section>
    </div>
  );
}
