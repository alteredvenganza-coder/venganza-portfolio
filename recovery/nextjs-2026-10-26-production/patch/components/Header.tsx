"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

// Replace with a real, approved video path when ready, e.g. /media/studio-showreel.mp4.
const SHOWREEL_URL = "/media/menu-motion.mp4";

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

  const navLinks = (className: string, inHomeDock = false) => (
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
          onClick={(event) => {
            if (inHomeDock) {
              event.preventDefault();
              setOverlayOpen(true);
            } else {
              setOverlayOpen(false);
            }
          }}
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
        <aside
          className="av-home-dock"
          aria-label="Home navigation"
          onMouseEnter={() => {
            if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
              setOverlayOpen(true);
            }
          }}
        >
          <button
            type="button"
            className="av-home-dock__trigger"
            aria-label="Open fullscreen navigation"
            aria-expanded={overlayOpen}
            onClick={() => setOverlayOpen(true)}
          >
            MENU <span aria-hidden="true">＋</span>
          </button>
          {navLinks("av-home-dock__nav", true)}
        </aside>
      )}

      {preview && !overlayOpen && !onHome && (
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
        <>
          <button
            type="button"
            className="av-menu-overlay-backdrop"
            aria-label="Close navigation overlay"
            tabIndex={-1}
            onClick={() => setOverlayOpen(false)}
          />
          <div className="av-menu-overlay" role="dialog" aria-modal="true" aria-label="Studio navigation">
            <div className="av-menu-overlay__top">
              <span><b>AV /</b> ALTERED VENGANZA</span>
              <span className="av-menu-overlay__top-center">INDEX — EXPLORE THE STUDIO</span>
              <button type="button" className="av-menu-overlay__close" onClick={() => setOverlayOpen(false)} aria-label="Close navigation">
                CLOSE <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="av-menu-overlay__body">
              <nav className="av-menu-overlay__links" aria-label="Fullscreen navigation">
                {NAV.map((item, i) => (
                  <Link
                    href={item.href}
                    key={item.href}
                    onClick={() => setOverlayOpen(false)}
                    onMouseEnter={() => setPreview(item)}
                    onFocus={() => setPreview(item)}
                    aria-current={section === item.href ? "page" : undefined}
                  >
                    <span>{String(i).padStart(2, "0")}</span>
                    {item.label}
                    <span className="av-menu-overlay__arrow" aria-hidden="true">↗</span>
                  </Link>
                ))}
              </nav>
              <div className="av-menu-overlay__media">
                <video
                  src={SHOWREEL_URL}
                  poster="/media/menu-motion-poster.png"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Altered Venganza studio motion ident"
                  onLoadedData={(event) => {
                    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                      event.currentTarget.pause();
                    }
                  }}
                >
                  Your browser does not support video playback.
                </video>
                <div className="av-menu-overlay__media-caption">
                  <span>ALTERED / MOTION STUDY 001</span>
                  <span>LOOP / 06 SEC</span>
                </div>
              </div>
              <div className="av-menu-overlay__aside">
                <span className="av-menu-overlay__aside-index">{preview?.eyebrow ?? "ALTERED / VENGANZA"}</span>
                <p>{preview?.summary ?? "An independent creative studio. Explore the work, services, and ideas behind the practice."}</p>
                <span className="av-menu-overlay__aside-bottom">TRIESTE · ITALY<br />EST. 2020</span>
              </div>
            </div>
            <div className="av-menu-overlay__footer">
              <span>CREATIVE STUDIO / FASHION / DESIGN / DIGITAL</span>
              <span>ESC OR CLOSE TO EXIT</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
