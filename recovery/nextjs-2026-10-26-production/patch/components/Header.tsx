"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

type NavItem = { label: string; href: string; summary: string; eyebrow: string; clip: string };

const NAV: NavItem[] = [
  { label: "HELLO", href: "/", eyebrow: "00 / WELCOME", summary: "The studio's entrance.", clip: "hello" },
  { label: "ALTERED VENGANZA?", href: "/altered-venganza", eyebrow: "01 / ABOUT", summary: "The creative practice behind the studio.", clip: "altered-venganza" },
  { label: "P'RO-JECTZ", href: "/pro-jectz", eyebrow: "02 / SELECTED WORK", summary: "Selected projects and collaborations.", clip: "pro-jectz" },
  { label: "SER-VICES", href: "/ser-vices", eyebrow: "03 / WHAT WE DO", summary: "Design, identity and digital services.", clip: "ser-vices" },
  { label: "SOFTWARE", href: "/software", eyebrow: "04 / DIGITAL TOOLS", summary: "Studio software and creative systems.", clip: "software" },
  { label: "INQUIRE", href: "/inquire", eyebrow: "05 / NEW PROJECT", summary: "Start a brief with the studio.", clip: "inquire" },
];

export default function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<NavItem | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const projectSlugs = ["04-studios", "sanera-houston", "victory-plus", "78p", "atomic-studios"];
  const serviceSlugs = ["pre-made", "custom-design", "logo-and-visual"];
  const slug = pathname.split("/")[1] ?? "";
  const section = pathname.startsWith("/ser-vices/") ? "/ser-vices" : projectSlugs.includes(slug)
    ? "/pro-jectz" : serviceSlugs.includes(slug) ? "/ser-vices" : "/" + slug;

  useEffect(() => {
    setMobileMenuOpen(false);
    setHovered(null);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeydown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!hovered || mobileMenuOpen) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHovered(null);
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [hovered, mobileMenuOpen]);

  const showPreview = (item: NavItem) => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setHovered(item);
    }
  };

  const navLinks = (className: string) => (
    <nav
      className={className}
      aria-label="Main navigation"
      onMouseLeave={() => { if (!mobileMenuOpen) setHovered(null); }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !mobileMenuOpen) {
          setHovered(null);
        }
      }}
    >
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={section === item.href ? "page" : undefined}
          onMouseEnter={() => showPreview(item)}
          onFocus={() => setHovered(item)}
          onClick={() => { setMobileMenuOpen(false); setHovered(null); }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const selected = hovered ?? (mobileMenuOpen ? NAV.find((item) => item.href === section) ?? NAV[2] : null);
  const showVeil = selected !== null;

  return (
    <>
      <header className={`header av-header${onHome ? " av-header--home" : ""}`}>
        <Link href="/" className="brand">{site.email}</Link>
        {!onHome && navLinks("nav av-desktop-nav")}
        {!onHome && (
          <button
            type="button"
            className="menu-btn av-mobile-menu-button"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            aria-controls="av-mobile-nav"
            onClick={() => { setMobileMenuOpen((prev) => !prev); setHovered(null); }}
          >
            {mobileMenuOpen ? "CLOSE ×" : "MENU"}
          </button>
        )}
      </header>

      {onHome && (
        <aside className="av-home-dock" aria-label="Home navigation">
          <button
            type="button"
            className="av-home-dock__trigger"
            aria-label={mobileMenuOpen ? "Close menu preview" : "Open menu preview"}
            aria-expanded={mobileMenuOpen}
            onClick={() => { setMobileMenuOpen((prev) => !prev); setHovered(null); }}
          >
            {mobileMenuOpen ? "CLOSE −" : "MENU +"}
          </button>
          {navLinks("av-home-dock__nav")}
        </aside>
      )}

      {showVeil && selected && (
        <>
          <div className="av-menu-teaser-veil" aria-hidden="true" />
          {mobileMenuOpen && !onHome && (
            <button
              type="button"
              className="av-menu-teaser-dismiss"
              aria-label="Close preview"
              onClick={() => { setMobileMenuOpen(false); setHovered(null); }}
            />
          )}
          <div className="av-menu-teaser-video" aria-hidden="true">
            <video
              key={selected.clip}
              src={`/media/menu-previews/${selected.clip}.mp4`}
              poster={`/media/menu-previews/${selected.clip}.png`}
              autoPlay={!reducedMotion}
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        </>
      )}

      {mobileMenuOpen && !onHome && (
        <div className="av-mobile-floating-nav" id="av-mobile-nav">
          {navLinks("av-mobile-floating-nav__links")}
        </div>
      )}
    </>
  );
}
