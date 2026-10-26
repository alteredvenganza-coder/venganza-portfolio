"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useInquiry } from "@/components/InquiryProvider";
import { SERVICES } from "@/content/services";

const BUDGETS = ["Not sure yet", "Under €500", "€500–€1,500", "€1,500–€3,500", "€3,500–€7,500", "€7,500+", "Let's discuss"];
const MAX_FILE = 3 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

type Receipt = {
  reference: string;
  date: string;
  customerReceiptSent: boolean;
  names: string[];
  name: string;
  email: string;
  phone: string;
  budget: string;
  message: string;
  file: string | null;
};

export default function InquirePage() {
  const { ids, remove, clear } = useInquiry();
  const selected = useMemo(() => SERVICES.filter((service) => ids.includes(service.id)), [ids]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [website, setWebsite] = useState(""); // Honeypot: leave hidden to humans.
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function chooseFile(incoming: File | null) {
    if (!incoming) { setFile(null); return; }
    if (!ALLOWED_FILE_TYPES.has(incoming.type)) {
      setError("Use a JPG, PNG, WEBP or PDF file."); return;
    }
    if (incoming.size > MAX_FILE) {
      setError("Your attachment must be smaller than 3 MB."); return;
    }
    setError("");
    setFile(incoming);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const body = new FormData();
      body.set("name", name.trim());
      body.set("email", email.trim());
      body.set("phone", phone.trim());
      body.set("budget", budget);
      body.set("message", message.trim());
      body.set("website", website);
      body.set("services", JSON.stringify(ids));
      if (file) body.set("attachment", file, file.name);
      const response = await fetch("/api/inquiries", { method: "POST", body, cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.reference) throw new Error(data.error || "Could not submit this inquiry. Please try again.");
      setReceipt({
        reference: data.reference,
        date: new Date().toISOString(),
        customerReceiptSent: Boolean(data.customerReceiptSent),
        names: selected.map((service) => service.name), name, email, phone, budget, message,
        file: file?.name || null,
      });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your inquiry.");
    } finally { setSending(false); }
  }

  if (receipt) return (
    <section className="av-inquiry-success">
      <div className="av-services-eyebrow"><span>ALTERED VENGANZA / INQUIRY</span><span>REQUEST RECEIVED</span></div>
      <div className="av-inquiry-success__top"><span>AV / REQUEST RECEIPT</span><span>01 / CONFIRMED</span></div>
      <h1>INQUIRY<br />RECEIVED<span>.</span></h1>
      <p>We received your request. This is not a purchase or a confirmed price.</p>
      <div className="av-receipt" aria-label="Inquiry receipt">
        <div className="av-receipt__header"><strong>ALTERED VENGANZA</strong><span>PROJECT INQUIRY / RECEIPT</span></div>
        <div className="av-receipt__line"><span>REFERENCE</span><strong>{receipt.reference}</strong></div>
        <div className="av-receipt__line"><span>DATE (UTC)</span><strong>{new Date(receipt.date).toLocaleString("en-GB", { timeZone: "UTC" })}</strong></div>
        <div className="av-receipt__line"><span>NAME</span><strong>{receipt.name}</strong></div>
        <div className="av-receipt__line"><span>EMAIL</span><strong>{receipt.email}</strong></div>
        {receipt.phone && <div className="av-receipt__line"><span>PHONE</span><strong>{receipt.phone}</strong></div>}
        <div className="av-receipt__divider">- - - - - - - - - - - - - - - - - - - - -</div>
        <strong className="av-receipt__caption">PROJECT / SELECTED SERVICES</strong>
        <ol>{receipt.names.length ? receipt.names.map((title) => <li key={title}>{title}</li>) : <li>General project inquiry</li>}</ol>
        <div className="av-receipt__line"><span>BUDGET</span><strong>{receipt.budget}</strong></div>
        <div className="av-receipt__line"><span>ATTACHMENT</span><strong>{receipt.file || "None"}</strong></div>
        <div className="av-receipt__divider">- - - - - - - - - - - - - - - - - - - - -</div>
        <strong className="av-receipt__caption">YOUR BRIEF</strong><p>{receipt.message}</p>
        <div className="av-receipt__footer">THANK YOU / WE WILL REVIEW YOUR BRIEF.<br />THIS RECEIPT IS NOT AN INVOICE.</div>
      </div>
      <p className="av-receipt-delivery">{receipt.customerReceiptSent ? "A copy of your receipt was emailed to you." : "We received your request, but we could not send the customer email copy. You can print this receipt."}</p>
      <div className="av-inquiry-success__actions"><button type="button" onClick={() => window.print()}>PRINT RECEIPT ↗</button><Link href="/ser-vices">BACK TO SERVICES ↗</Link></div>
    </section>
  );

  return (
    <section className="av-inquiry-page av-msn-page">
      <div className="av-services-eyebrow av-msn-outer-eyebrow">
        <span>ALTERED VENGANZA / STUDIO INQUIRIES</span>
        <span>01 / WELCOME · NO PAYMENT</span>
      </div>
      <header className="av-msn-intro">
        <span>ALTERED LIVE / 01</span>
        <h1>INQUIRE<span>.</span></h1>
        <p>A window into your next project. Tell us what you want to create.</p>
      </header>
      <div className="av-msn-window">
        <div className="av-msn-titlebar">
          <div className="av-msn-appname">
            <span className="av-msn-appicon">AV</span>
            <strong>Altered Live Messenger</strong>
            <span className="av-msn-titlebar-sep">/</span>
            <span className="av-msn-titlebar-subtitle">INQUIRIES</span>
          </div>
          <div className="av-msn-window-controls" aria-hidden="true"><span>—</span><span>□</span><span>×</span></div>
        </div>
        <div className="av-msn-toolbar">
          <span>File</span><span>Services</span><span>Studio</span>
          <span className="av-msn-toolbar-status"><i /> STUDIO ONLINE / Inquire</span>
        </div>
        <div className="av-msn-workspace">
          <aside className="av-msn-side">
            <div className="av-msn-side-profile">
              <div className="av-msn-avatar"><span>AV</span></div>
              <div><strong>Altered Venganza</strong><span><i className="av-msn-online-dot" /> Available for inquiries</span></div>
            </div>
            <div className="av-msn-side-header">
              <span>SAVED SELECTION</span>
              <strong>{selected.length.toString().padStart(2, "0")} <small>services</small></strong>
            </div>
            <div className="av-msn-contacts">
              {selected.length ? selected.map((service) => (
                <div className="av-msn-contact" key={service.id}>
                  <span className="av-msn-contact-mark">✦</span>
                  <div className="av-msn-contact-copy"><strong>{service.name}</strong><small>{service.category}</small></div>
                  <button type="button" onClick={() => remove(service.id)} aria-label={"Remove " + service.name}>×</button>
                </div>
              )) : (
                <div className="av-msn-empty-contacts">
                  <span>✧</span><p>Empty selection. You can still start a general inquiry.</p>
                </div>
              )}
            </div>
            <Link href="/ser-vices" className="av-msn-add-service">+ ADD ANOTHER SERVICE</Link>
            <div className="av-msn-side-bottom"><i className="av-msn-online-indicator" /> NO ACCOUNT NEEDED <small>STUDIO / 04</small></div>
          </aside>
          <div className="av-msn-main">
            <div className="av-msn-main-head">
              <div>
                <span className="av-msn-kicker">SIGN IN TO YOUR NEXT IDEA / NO LOGIN REQUIRED</span>
                <h2>Welcome<em>.</em></h2>
                <p>What can we create together?</p>
              </div>
              <div className="av-msn-main-bubbles" aria-hidden="true"><i /><i /><i /></div>
            </div>
            <div className="av-msn-conversation-bar">
              <span><i className="av-msn-online-indicator" /> STUDIO CHAT · INITIAL BRIEF</span>
              <span>SECURE REQUEST / NO CHARGE</span>
            </div>
            <div className="av-msn-message">
              <span className="av-msn-message-avatar">AV</span>
              <div><strong>ALTERED VENGANZA says:</strong>
                <p>Welcome to the studio. Tell us about your idea, add reference files and we will reply with next steps and a tailored quote.</p>
              </div>
            </div>
            <form className="av-inquiry-form av-msn-form" onSubmit={submit}>
              <div className="av-msn-form-label">YOUR DETAILS <span>* required</span></div>
              <div className="av-inquiry-two">
                <label>FULL NAME *<input required maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
                <label>EMAIL *<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              </div>
              <div className="av-inquiry-two">
                <label>PHONE <span>optional</span><input maxLength={50} type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+39 …" /></label>
                <label>PROJECT BUDGET *<select required value={budget} onChange={(event) => setBudget(event.target.value)}>
                  {BUDGETS.map((entry) => <option key={entry}>{entry}</option>)}
                </select></label>
              </div>
              <label>WHAT DO YOU HAVE IN MIND? *
                <textarea required minLength={10} maxLength={3000} rows={5} value={message} onChange={(event) => setMessage(event.target.value)}
                  placeholder="Your project, timing, references and anything you want us to know…" />
              </label>
              <div className="av-inquiry-upload av-msn-attachment">
                <div><span aria-hidden="true">📎</span><p>REFERENCE FILE<small>Optional · JPG / PNG / WEBP / PDF · Max 3 MB</small></p></div>
                <button type="button" onClick={() => inputRef.current?.click()}>{file ? file.name : "+ Browse files"}</button>
                <input ref={inputRef} type="file" hidden accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(event) => chooseFile(event.target.files?.[0] || null)} />
                {file && <button type="button" className="av-inquiry-removefile" onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}>REMOVE ×</button>}
              </div>
              <div className="av-inquiry-honeypot" aria-hidden="true">
                <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
              </div>
              {error && <p role="alert" className="av-inquiry-error">{error}</p>}
              <div className="av-inquiry-submit av-msn-submit">
                <span>NO PAYMENT REQUIRED</span>
                <button type="submit" disabled={sending}>{sending ? "SENDING…" : "SEND INQUIRY ↗"}</button>
              </div>
              <p className="av-inquiry-privacy">
                Your information and attached file will only be used to evaluate and respond to your inquiry.
                Do not upload sensitive documents. Email delivery requires a configured verified sender.
              </p>
            </form>
          </div>
        </div>
        <div className="av-msn-window-footer">
          <span>ALTERED LIVE™ / ONLINE STUDIO</span><span>BUILT FOR CREATIVE CONVERSATIONS</span>
        </div>
      </div>
      <footer className="av-msn-page-foot">
        <span>ALTERED VENGANZA / TRIESTE ITALY</span>
        <Link href="/ser-vices">← EXPLORE SERVICES</Link>
      </footer>
    </section>
  );
}
