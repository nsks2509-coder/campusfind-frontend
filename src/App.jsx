import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const blankReport = {
  title: "", type: "FOUND", category: "Electronics", description: "",
  location: "", contactName: "", contactEmail: ""
};
const blankClaim = { claimantName: "", claimantEmail: "", message: "" };
const categories = ["Electronics", "ID Cards", "Bags", "Books", "Clothing", "Keys", "Accessories", "Other"];

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrow: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>
  };
  return <svg {...common}>{paths[name] || paths.box}</svg>;
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div><span className="eyebrow">CAMPUSFIND</span><h2>{title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function ReportForm({ onSubmit, busy, onCancel }) {
  const [form, setForm] = useState(blankReport);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="segmented">
        <button type="button" className={form.type === "FOUND" ? "selected found" : ""} onClick={() => setForm({ ...form, type: "FOUND" })}>I found something</button>
        <button type="button" className={form.type === "LOST" ? "selected lost" : ""} onClick={() => setForm({ ...form, type: "LOST" })}>I lost something</button>
      </div>
      <label>Item title<input name="title" value={form.title} onChange={update} placeholder="e.g. Blue water bottle" maxLength="100" required /></label>
      <div className="form-grid">
        <label>Category<select name="category" value={form.category} onChange={update}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Campus location<input name="location" value={form.location} onChange={update} placeholder="e.g. Library, 2nd floor" maxLength="120" required /></label>
      </div>
      <label>Description<textarea name="description" value={form.description} onChange={update} placeholder="Describe the item. Avoid sharing sensitive personal details." rows="3" maxLength="1500" required /></label>
      <div className="form-grid">
        <label>Your name<input name="contactName" value={form.contactName} onChange={update} maxLength="80" required /></label>
        <label>Your email<input type="email" name="contactEmail" value={form.contactEmail} onChange={update} maxLength="160" required /></label>
      </div>
      <p className="form-note">Your contact details are stored with the report. Do not enter passwords or sensitive information.</p>
      <div className="form-actions"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Publishing…" : "Publish report"} <Icon name="arrow" size={16}/></button></div>
    </form>
  );
}

function ClaimForm({ item, onSubmit, busy, onCancel }) {
  const [form, setForm] = useState(blankClaim);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  return (
    <form className="form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      <div className="claim-target"><span className="type-badge">{item.type}</span><strong>{item.title}</strong><span className="muted"><Icon name="pin" size={14}/> {item.location}</span></div>
      <label>Your name<input name="claimantName" value={form.claimantName} onChange={update} maxLength="80" required /></label>
      <label>Email<input type="email" name="claimantEmail" value={form.claimantEmail} onChange={update} maxLength="160" required /></label>
      <label>Proof of ownership<textarea name="message" value={form.message} onChange={update} placeholder="Describe a detail that helps verify this item belongs to you." rows="4" maxLength="1000" required /></label>
      <p className="form-note">Do not include passwords, ID numbers, or other sensitive personal information.</p>
      <div className="form-actions"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Sending…" : "Send claim"} <Icon name="arrow" size={16}/></button></div>
    </form>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await api.listItems({ q: query, type, category }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, type, category]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const counts = useMemo(() => ({
    all: items.length,
    lost: items.filter((item) => item.type === "LOST").length,
    found: items.filter((item) => item.type === "FOUND").length
  }), [items]);

  async function publishReport(data) {
    setBusy(true);
    setNotice("");
    try {
      await api.createItem(data);
      setModal(null);
      setNotice("Your report was published.");
      await loadItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitClaim(data) {
    setBusy(true);
    setNotice("");
    try {
      await api.createClaim(modal.item.id, data);
      setModal(null);
      setNotice("Claim submitted. Keep the details you provided so you can follow up with the item reporter.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="CampusFind home"><span className="brand-mark"><Icon name="box" size={21}/></span><span>campus<span className="brand-accent">find</span><small>LOST & FOUND, TOGETHER.</small></span></a>
        <nav className="top-nav"><a href="#browse">Browse reports</a><a href="#how-it-works">How it works</a></nav>
        <button className="button button-primary top-cta" onClick={() => setModal({ kind: "report" })}><Icon name="plus" size={17}/> Post a report</button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-label"><span className="pulse-dot"/> YOUR CAMPUS, CONNECTED</div>
            <h1>Lost something?<br/><em>Let's bring it home.</em></h1>
            <p className="hero-text">A little help from your campus community goes a long way. Search what's been found or let others know what you're missing.</p>
            <div className="hero-actions"><a href="#browse" className="button button-dark">Explore reports <Icon name="arrow" size={16}/></a><button className="button button-light" onClick={() => setModal({ kind: "report" })}><Icon name="plus" size={16}/> Post an item</button></div>
            <div className="trust-line"><span><Icon name="check" size={15}/> Community-powered</span><span><Icon name="check" size={15}/> Simple claim process</span></div>
          </div>
          <div className="hero-art" aria-label="Illustration of a lost item being found">
            <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
            <div className="floating-note note-top"><span className="mini-icon orange"><Icon name="box" size={17}/></span><span><strong>Found nearby</strong><small>Something helpful starts here</small></span><span className="tiny-check"><Icon name="check" size={13}/></span></div>
            <div className="illustration-card"><div className="illustration-top"><span>FIELD NOTE 014</span><span>CF—01</span></div><div className="illustration-object"><div className="bottle-cap"/><div className="bottle-body"><div className="bottle-label">FOUND<br/><small>ON CAMPUS</small></div></div></div><div className="illustration-caption"><span className="caption-dot"/><span>Every item has a way back.</span></div></div>
            <div className="floating-note note-bottom"><span className="mini-icon green"><Icon name="search" size={17}/></span><span><strong>One community</strong><small>One item at a time</small></span></div>
            <span className="spark spark-a">✳</span><span className="spark spark-b">✳</span>
          </div>
        </section>

        <section className="stats-row" aria-label="Report counts">
          <div><span className="stat-label">VISIBLE REPORTS</span><strong>{counts.all.toString().padStart(2, "0")}</strong></div>
          <div><span className="stat-label">LOST ITEMS</span><strong>{counts.lost.toString().padStart(2, "0")}</strong></div>
          <div><span className="stat-label">FOUND ITEMS</span><strong>{counts.found.toString().padStart(2, "0")}</strong></div>
          <div className="stats-note">Small acts of honesty<br/>make a big difference.</div>
        </section>

        <section className="browse-section" id="browse">
          <div className="section-heading"><div><div className="eyebrow">THE COMMUNITY BOARD</div><h2>Recently reported<span className="heading-dot">.</span></h2><p>Browse recent reports from around your campus.</p></div><button className="text-button" onClick={() => setModal({ kind: "report" })}>Add a report <Icon name="arrow" size={16}/></button></div>

          <div className="filter-bar">
            <div className="search-box"><Icon name="search" size={19}/><input aria-label="Search reports" placeholder="Search an item, place or detail..." value={query} onChange={(event) => setQuery(event.target.value)}/>{query && <button className="clear-search" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={15}/></button>}</div>
            <div className="filter-selects"><select aria-label="Filter by report type" value={type} onChange={(event) => setType(event.target.value)}><option value="ALL">All reports</option><option value="LOST">Lost items</option><option value="FOUND">Found items</option></select><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="ALL">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
          </div>

          {notice && <div className="notice success"><Icon name="check" size={17}/><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
          {error && <div className="notice error"><strong>Something went wrong.</strong><span>{error}</span><button onClick={() => { setError(""); loadItems(); }}>Retry</button></div>}

          {loading ? <div className="loading-state"><span className="spinner"/> Loading campus reports…</div> : items.length ? (
            <div className="item-grid">
              {items.map((item) => <article className="item-card" key={item.id}>
                <div className={`item-card-banner ${item.type === "LOST" ? "banner-lost" : "banner-found"}`}><span className="type-badge">{item.type === "LOST" ? "LOST ITEM" : "FOUND ITEM"}</span><span className="item-number">CF—{String(item.id).padStart(4, "0")}</span><div className="item-watermark"><Icon name="box" size={54}/></div></div>
                <div className="item-card-content"><div className="item-category">{item.category || "Other"} <span>·</span> {item.status || "OPEN"}</div><h3>{item.title}</h3><p className="item-description">{item.description}</p><div className="item-location"><Icon name="pin" size={15}/><span>{item.location}</span></div><div className="item-card-footer"><span className="reporter"><span className="avatar">{(item.contactName || "C").trim().charAt(0).toUpperCase()}</span><span><strong>{item.contactName || "Campus member"}</strong><small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently reported"}</small></span></span><button className="claim-button" onClick={() => setModal({ kind: "claim", item })}>This is mine <Icon name="arrow" size={15}/></button></div></div>
              </article>)}
            </div>
          ) : <div className="empty-state"><div className="empty-illustration"><Icon name="search" size={25}/></div><h3>No matching reports</h3><p>Try another search or be the first to post a report.</p><button className="button button-primary" onClick={() => setModal({ kind: "report" })}><Icon name="plus" size={16}/> Post a report</button></div>}
        </section>

        <section className="how-section" id="how-it-works">
          <div><div className="eyebrow">A BETTER WAY TO RECONNECT</div><h2>From lost to found,<br/><em>in a few simple steps.</em></h2></div>
          <div className="steps"><article><span>01</span><h3>Report it</h3><p>Post what you lost or found and where it happened.</p></article><article><span>02</span><h3>Find a match</h3><p>Search campus reports and compare the details.</p></article><article><span>03</span><h3>Make a claim</h3><p>Explain why the item belongs to you and coordinate a safe return.</p></article></div>
        </section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark"><Icon name="box" size={18}/></span><span>campus<span className="brand-accent">find</span><small>LOST & FOUND, TOGETHER.</small></span></a><span>Built for a more helpful campus.</span><span>CampusFind © {new Date().getFullYear()}</span></footer>

      {modal?.kind === "report" && <Modal title="Post a report" onClose={() => !busy && setModal(null)}><ReportForm onSubmit={publishReport} busy={busy} onCancel={() => setModal(null)}/></Modal>}
      {modal?.kind === "claim" && <Modal title="Claim an item" onClose={() => !busy && setModal(null)}><ClaimForm item={modal.item} onSubmit={submitClaim} busy={busy} onCancel={() => setModal(null)}/></Modal>}
    </div>
  );
}