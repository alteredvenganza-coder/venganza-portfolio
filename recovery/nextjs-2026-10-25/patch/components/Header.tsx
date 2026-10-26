"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

// Replace with a real, approved video path when ready, e.g. /media/studio-showreel.mp4.
const SHOWREEL_URL = "";

type NavItem = { label: string; href: string; summary: string; eyebrow: string };
const NAV: NavItem[] = [
  { label: "HELLO", href: "/", eyebrow: "00 / WELCOME", summary: "The studio's entrance. A place to begin." },
  { label: "ALTERED VENGANZA?", href: "/altered-venganza", eyebrow: "01 / ABOUT", summary: "The people, practice and point of view behind the studio." },
  { label: "P'RO-JECTZ", href: "/pro-jectz", eyebrow: "02 / SELECTED WORK", summary: "An index of fashion, identities, experiments and collaborations." },
  { label: "SER-VICES", href: "/ser-vices", eyebrow: "03 / WHAT WE DO", summary: "Creative direction, design and selected services." },
  { label: "SOFTWARE", href: "/software", eyebrow: "04 / DIGITAL TOOLS", summary: "MAT TRY-ON, DROP ENGINE and MAT RENDERS." },
  { label: "INQUIRE", href: "/inquire", eyebrow: "05 / NEW PROJECT", summary: "Start a brief or request a quote for selected services." },
];

export default function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [preview, setPreview] = useState<NavItem | null>(null);

  const projectSlugs = ["04-studios", "sanera-houston", "victory-plus", "78p", "atomic-studios"];
  const serviceSlugs = ["pre-made", "custom-design", "logo-and-visual", "ser-vices"];
  const slug = pathname.split("/")[1] ?? "";
  const section = pathname.startsWith("/ser-vices/") ? "/ser-vices" : projectSlugs.includes(slug)
    ? "/pro-jectz"
    : serviceSlugs.includes(slug)
      ? "/ser-vices"
      : "/" + slug;

  useEffect(() => {
    setOverlayOpen(false);
    setPreview(null);
  }, [pathname]);

  useEffect(() => {
    if (!overlayOpen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlayOpen(false);
    };
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKeydown);
    };
  }, [overlayOpen]);

  const navLinks = (className: string) => (
    <nav className={className} aria-label="Main navigation">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={section === item.href ? "page" : undefined}
          onMouseEnter={() => setPreview(item)}
          onMouseLeave={() => setPreview(null)}
          onFocus={() => setPreview(item)}
          onBlur={() => setPreview(null)}
          onClick={() => setOverlayOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <header className={`header av-header${onHome ? " av-header--home" : ""}`}>
        <Link href="/" className="brand">{site.email}</Link>
        {!onHome && navLinks("nav av-desktop-nav")}
        {!onHome && (
          <button
            type="button"
            className="menu-btn av-mobile-menu-button"
            aria-label="Open navigation menu"
            aria-expanded={overlayOpen}
            onClick={() => setOverlayOpen(true)}
          >
            MENU
          </button>
        )}
      </header>

      {onHome && (
        <aside className="av-home-dock" aria-label="Home navigation">
          <button
            type="button"
            className="av-home-dock__trigger"
            aria-label="Open fullscreen navigation"
            aria-expanded={overlayOpen}
            onClick={() => setOverlayOpen(true)}
          >
            MENU <span aria-hidden="true">＋</span>
          </button>
          {navLinks("av-home-dock__nav")}
        </aside>
      )}

      {preview && !overlayOpen && (
        <aside
          className={`av-hover-preview${onHome ? " av-hover-preview--home" : ""}`}
          aria-live="polite"
        >
          <div className="av-hover-preview__art" aria-hidden="true">
            <span>{preview.eyebrow}</span>
            <strong>{preview.label}</strong>
          </div>
          <p>{preview.summary}</p>
          <small>OPEN SECTION ↗</small>
        </aside>
      )}

      {overlayOpen && (
        <div className="av-menu-overlay" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="av-menu-overlay__top">
            <span>ALTERED VENGANZA / INDEX</span>
            <button type="button" onClick={() => setOverlayOpen(false)} aria-label="Close menu">
              CLOSE ×
            </button>
          </div>
          <div className="av-menu-overlay__body">
            <div className="av-menu-overlay__media">
              {SHOWREEL_URL ? (
                <video src={SHOWREEL_URL} autoPlay muted loop playsInline preload="metadata" />
              ) : (
                <div className="av-menu-overlay__media-placeholder">
                  <span>STUDIO SHOWREEL</span>
                  <strong>COMING INTO FOCUS.</strong>
                  <small>VISUAL PREVIEW / VIDEO SLOT</small>
                </div>
              )}
            </div>
            <nav className="av-menu-overlay__links" aria-label="Fullscreen navigation">
              {NAV.map((item, i) => (
                <Link
                  href={item.href}
                  key={item.href}
                  onClick={() => setOverlayOpen(false)}
                  aria-current={section === item.href ? "page" : undefined}
                >
                  <span>{String(i).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <span className="av-menu-overlay__footer">DESIGN / EXPERIMENT / SOFTWARE</span>
        </div>
      )}
    </>
  );
}
