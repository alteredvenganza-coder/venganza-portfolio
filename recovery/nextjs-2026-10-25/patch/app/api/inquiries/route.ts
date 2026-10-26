import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { SERVICES } from "@/content/services";

export const runtime = "nodejs";

const MAX_FILE = 3 * 1024 * 1024;
const allowedFileTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const budgets = new Set(["Not sure yet", "Under €500", "€500–€1,500", "€1,500–€3,500", "€3,500–€7,500", "€7,500+", "Let's discuss"]);

const safe = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const line = (label: string, value: string) => `<tr><td style="color:#777;font-size:11px;letter-spacing:.05em;padding:10px 10px 10px 0;vertical-align:top">${safe(label)}</td><td style="font-size:12px;padding:10px 0;overflow-wrap:anywhere">${safe(value)}</td></tr>`;

function makeReceipt(reference: string, record: { name: string; email: string; phone: string; budget: string; message: string; services: string[]; fileName: string; date: string }) {
  const serviceRows = record.services.length ? record.services.join(" / ") : "General project inquiry";
  return `<!doctype html><html><body style="margin:0;padding:35px 12px;background:#f6f6f5;color:#161616;font-family:Arial,Helvetica,sans-serif"><div style="max-width:520px;margin:auto;background:white;padding:28px;border:1px solid #ddd"><div style="display:flex;justify-content:space-between;border-bottom:1px solid #161616;padding-bottom:18px"><strong style="font-size:15px;font-weight:500">ALTERED VENGANZA</strong><span style="font-size:10px;color:#777">INQUIRY RECEIPT</span></div><h1 style="font-size:42px;line-height:.98;letter-spacing:-.05em;font-weight:400;margin:34px 0 28px">REQUEST<br>RECEIVED.</h1><table style="width:100%;border-collapse:collapse;text-align:left">${line("REFERENCE",reference)}${line("DATE (UTC)",record.date)}${line("NAME",record.name)}${line("EMAIL",record.email)}${record.phone?line("PHONE",record.phone):""}${line("SERVICES",serviceRows)}${line("BUDGET",record.budget)}${line("ATTACHMENT",record.fileName||"None")}</table><div style="border-top:1px dashed #999;margin-top:18px;padding-top:18px"><div style="font-size:11px;color:#777;margin-bottom:10px">YOUR BRIEF</div><p style="font-size:13px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere">${safe(record.message)}</p></div><div style="font-size:10px;color:#777;border-top:1px solid #ddd;margin-top:30px;padding-top:18px;line-height:1.7">WE WILL REVIEW YOUR REQUEST.<br>THIS IS NOT AN INVOICE OR CONFIRMED QUOTE.</div></div></body></html>`;
}

async function sendViaResend(key: string, payload: Record<string, unknown>) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload), cache: "no-store",
  });
  if (!response.ok) throw new Error(`Email provider rejected request (${response.status})`);
}

export async function POST(request: NextRequest) {
  try {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.INQUIRY_FROM_EMAIL;
    const to = process.env.INQUIRY_TO_EMAIL || "hello@altered-venganza.com";
    if (!key || !from) return NextResponse.json({ error: "Inquiry email is not configured yet. Please contact the studio directly." }, { status: 503 });

    const form = await request.formData();
    if (text(form, "website")) return NextResponse.json({ error: "Could not process request." }, { status: 400 });
    const name = text(form, "name");
    const email = text(form, "email");
    const phone = text(form, "phone");
    const budget = text(form, "budget");
    const message = text(form, "message");
    if (name.length < 2 || name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length > 50 || message.length < 10 || message.length > 3000 || !budgets.has(budget)) {
      return NextResponse.json({ error: "Check your details and try again." }, { status: 400 });
    }
    let ids: unknown;
    try { ids = JSON.parse(text(form, "services") || "[]"); } catch { ids = null; }
    if (!Array.isArray(ids) || ids.length > SERVICES.length || ids.some((id) => typeof id !== "string")) return NextResponse.json({ error: "Invalid service selection." }, { status: 400 });
    const selected = [...new Set(ids as string[])];
    if (selected.some((id) => !SERVICES.find((entry) => entry.id === id))) return NextResponse.json({ error: "Invalid service selection." }, { status: 400 });
    const selectedNames = SERVICES.filter((service) => selected.includes(service.id)).map((service) => service.name);
    const upload = form.get("attachment");
    let fileName = "";
    let attachment: { filename: string; content: string; content_type: string } | null = null;
    if (upload instanceof File && upload.size > 0) {
      if (!allowedFileTypes.has(upload.type) || upload.size > MAX_FILE || !/\.(jpe?g|png|webp|pdf)$/i.test(upload.name)) {
        return NextResponse.json({ error: "Only JPG, PNG, WEBP or PDF files up to 3MB are allowed." }, { status: 400 });
      }
      fileName = upload.name.slice(0, 120).replace(/[\r\n]/g, " ");
      attachment = { filename: fileName, content: Buffer.from(await upload.arrayBuffer()).toString("base64"), content_type: upload.type };
    }

    const reference = `AV-${randomUUID().slice(0, 8).toUpperCase()}`;
    const date = new Date().toISOString();
    const html = makeReceipt(reference, { name, email, phone, budget, message, services: selectedNames, fileName, date });
    const subject = `[${reference}] New project inquiry — ${name}`;

    await sendViaResend(key, {
      from, to: [to], subject, html,
      reply_to: email,
      ...(attachment ? { attachments: [attachment] } : {}),
    });

    let customerReceiptSent = false;
    try {
      await sendViaResend(key, { from, to: [email], subject: `Your inquiry receipt — ${reference}`, html });
      customerReceiptSent = true;
    } catch (error) {
      console.error("Customer receipt delivery failed", reference, error instanceof Error ? error.message : "unknown");
    }

    return NextResponse.json({ reference, customerReceiptSent }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Inquiry endpoint failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "We couldn't submit your inquiry. Please try again." }, { status: 500 });
  }
}
