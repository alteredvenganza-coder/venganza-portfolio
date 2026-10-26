"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SERVICES } from "@/content/services";

type InquiryContextValue = {
  ids: string[];
  count: number;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

const KEY = "av-inquiry-selection-v1";
const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
      const allowed = new Set(SERVICES.map((service) => service.id));
      if (Array.isArray(saved)) setIds([...new Set(saved.filter((id): id is string => typeof id === "string" && allowed.has(id)))]);
    } catch { /* Private browsing or malformed storage: fall back to empty. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* Storage may be disabled. */ }
    }
  }, [ids, ready]);

  const add = useCallback((id: string) => {
    if (!SERVICES.some((service) => service.id === id)) return;
    setIds((previous) => previous.includes(id) ? previous : [...previous, id]);
  }, []);
  const remove = useCallback((id: string) => setIds((previous) => previous.filter((entry) => entry !== id)), []);
  const clear = useCallback(() => setIds([]), []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const value = useMemo(() => ({ ids, count: ids.length, add, remove, clear, has }), [ids, add, remove, clear, has]);

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry() {
  const value = useContext(InquiryContext);
  if (!value) throw new Error("useInquiry requires InquiryProvider");
  return value;
}

export function AddToInquiry({ id, large = false }: { id: string; large?: boolean }) {
  const { add, has } = useInquiry();
  const selected = has(id);
  return (
    <button type="button" className={`av-add-inquiry${large ? " av-add-inquiry--large" : ""}${selected ? " is-added" : ""}`} onClick={() => add(id)} disabled={selected} aria-label={selected ? "Service already included in inquiry" : "Add service to inquiry"}>
      <span aria-hidden="true">{selected ? "✓" : "+"}</span> {selected ? "ADDED TO INQUIRY" : "ADD TO INQUIRY"}
    </button>
  );
}

export function InquiryCounter() {
  const { count } = useInquiry();
  if (!count) return null;
  return (
    <Link className="av-inquiry-counter" href="/inquire" aria-label={`Open inquiry with ${count} selected services`}>
      <span>INQUIRY</span><strong>{String(count).padStart(2, "0")}</strong>
    </Link>
  );
}
