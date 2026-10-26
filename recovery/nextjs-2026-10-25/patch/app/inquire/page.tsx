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
    <div className="av-inquiry-page">
      <div className="av-services-eyebrow"><span>ALTERED VENGANZA / NEW PROJECT</span><span>NO PAYMENT REQUIRED</span></div>
      <div className="av-inquiry-heading"><p>01 / YOUR REQUEST</p><h1>INQUIRE<span>.</span></h1><p>Tell us what you want to create. Add services or start with a blank brief. We will review scope and availability before quoting.</p></div>
      <div className="av-inquiry-columns">
        <div className="av-inquiry-selection">
          <div className="av-inquiry-sectiontitle"><h2>YOUR SELECTION</h2><span>{String(selected.length).padStart(2, "0")} / SERVICES</span></div>
          {selected.length ? selected.map((service) => <div key={service.id} className="av-inquiry-selected"><div><small>{service.category}</small><strong>{service.name}</strong></div><button type="button" onClick={() => remove(service.id)} aria-label={`Remove ${service.name}`}>REMOVE ×</button></div>) : <p className="av-inquiry-empty">No services selected. You can still send a general inquiry.</p>}
          <Link href="/ser-vices" className="av-inquiry-more">+ ADD ANOTHER SERVICE</Link>
          <div className="av-inquiry-note"><span>NOTE / 01</span><p>Submitting a request is free. No payment or project commitment takes place until we agree on a brief and a quote.</p></div>
        </div>
        <form className="av-inquiry-form" onSubmit={submit}>
          <div className="av-inquiry-sectiontitle"><h2>YOUR DETAILS</h2><span>* REQUIRED</span></div>
          <div className="av-inquiry-two"><label>FULL NAME *<input required maxLength={120} autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></label><label>EMAIL *<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label></div>
          <div className="av-inquiry-two"><label>PHONE <span>OPTIONAL</span><input maxLength={50} type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39 …" /></label><label>PROJECT BUDGET *<select required value={budget} onChange={e => setBudget(e.target.value)}>{BUDGETS.map((entry) => <option key={entry}>{entry}</option>)}</select></label></div>
          <label>WHAT DO YOU HAVE IN MIND? *<textarea required minLength={10} maxLength={3000} rows={6} value={message} onChange={e => setMessage(e.target.value)} placeholder="Your project, references, timing, and anything you want us to know." /></label>
          <div className="av-inquiry-upload"><p>REFERENCE FILE <span>OPTIONAL · MAX 3MB</span></p><button type="button" onClick={() => inputRef.current?.click()}><span>＋</span>{file ? file.name : "ADD FILE — JPG / PNG / WEBP / PDF"}</button><input ref={inputRef} type="file" hidden accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e => chooseFile(e.target.files?.[0] || null)} />{file && <button className="av-inquiry-removefile" type="button" onClick={() => { setFile(null); if(inputRef.current) inputRef.current.value = ""; }}>REMOVE FILE ×</button>}</div>
          <div className="av-inquiry-honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label></div>
          {error && <p role="alert" className="av-inquiry-error">{error}</p>}
          <div className="av-inquiry-submit"><span>THIS IS AN INQUIRY, NOT A CHECKOUT.</span><button type="submit" disabled={sending}>{sending ? "SENDING…" : "SEND INQUIRY ↗"}</button></div>
          <p className="av-inquiry-privacy">Your information and attached file are used only to evaluate and respond to your request. Do not upload sensitive personal documents.</p>
        </form>
      </div>
    </div>
  );
}
