"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProjectConfig, ProjectPost } from "@/content/project-profiles";
import { getProjectPosts } from "@/content/project-profiles";

export default function ProjectProfile({ project, images }: { project: ProjectConfig; images: string[] }) {
  const posts = useMemo(() => getProjectPosts(project, images), [project, images]);
  const [tab, setTab] = useState<"gallery" | "reels">("gallery");
  const [shown, setShown] = useState(18);
  const [active, setActive] = useState<ProjectPost | null>(null);
  const [slide, setSlide] = useState(0);
  const lastFocused = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const filtered = posts.filter(post => tab === "gallery" ? post.kind !== "reel" : post.kind === "reel");
  const visible = filtered.slice(0, shown);
  const totalPhotos = images.length;
  const totalReels = project.reels.length;

  function openPost(post: ProjectPost) {
    lastFocused.current = document.activeElement as HTMLElement;
    setActive(post);
    setSlide(0);
  }
  function closePost() {
    setActive(null);
    lastFocused.current?.focus();
  }
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") closePost();
      if (event.key === "ArrowRight") setSlide(i => (i + 1) % active!.media.length);
      if (event.key === "ArrowLeft") setSlide(i => (i - 1 + active!.media.length) % active!.media.length);
    }
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = previous;
    };
  }, [active]);

  return (
    <section className="av-project-profile">
      <div className="av-project-profile__topline">
        <Link href="/pro-jectz">← BACK TO P’RO-JECTZ</Link>
        <span>ALTERED VENGANZA / CLIENT ARCHIVE</span>
      </div>
      <header className="av-project-profile__identity">
        <div className="av-project-profile__avatar" aria-label={`Profile image for ${project.name}`}>
          {project.profileImage || images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.profileImage || images[0]} alt={project.name} />
          ) : (
            <span aria-hidden="true">{project.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="av-project-profile__identity-content">
          <div className="av-project-profile__name-row">
            <div>
              <span className="av-project-profile__handle">@{project.handle}</span>
              <h1>{project.name}</h1>
            </div>
            {project.website && <a href={project.website} target="_blank" rel="noopener noreferrer" className="av-project-profile__website">VISIT WEBSITE ↗</a>}
          </div>
          <div className="av-project-profile__stats" aria-label="Project media counts">
            <span><strong>{String(posts.length).padStart(2, "0")}</strong> POSTS</span>
            <span><strong>{String(totalPhotos).padStart(2, "0")}</strong> IMAGES</span>
            <span><strong>{String(totalReels).padStart(2, "0")}</strong> REELS</span>
          </div>
          <p className="av-project-profile__category">{project.category}</p>
          <p className="av-project-profile__bio">{project.bio}</p>
          {project.website && <a href={project.website} target="_blank" rel="noopener noreferrer" className="av-project-profile__mobile-url">{project.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗</a>}
        </div>
      </header>
      <nav className="av-project-profile__tabs" aria-label="Project content">
        <button type="button" aria-pressed={tab === "gallery"} onClick={() => { setTab("gallery"); setShown(18); }}>
          <span aria-hidden="true">▦</span> GALLERY
        </button>
        <button type="button" aria-pressed={tab === "reels"} onClick={() => { setTab("reels"); setShown(18); }}>
          <span aria-hidden="true">▷</span> REELS
        </button>
      </nav>
      {visible.length ? (
        <div className="av-project-profile__grid">
          {visible.map((post, i) => (
            <button key={post.id} type="button" className="av-project-profile__post"
              onClick={() => openPost(post)} aria-label={`View ${post.kind} ${i + 1} for ${project.name}`}>
              {post.media[0].kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading={i < 6 ? "eager" : "lazy"} src={post.media[0].src} alt={`${project.name} visual ${i + 1}`} />
              ) : post.media[0].poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" src={post.media[0].poster} alt={`${project.name} reel poster`} />
              ) : (
                <span className="av-project-profile__video-cover">MOVING<br />IMAGE <small>PLAY ↗</small></span>
              )}
              <span className="av-project-profile__post-kind">{post.kind === "carousel" ? "▣" : post.kind === "reel" ? "▷" : ""}</span>
              <span className="av-project-profile__post-hover">OPEN {post.kind === "carousel" ? "CAROUSEL" : post.kind === "reel" ? "REEL" : "IMAGE"} ↗</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="av-project-profile__empty"><strong>{tab === "reels" ? "REELS, SOON." : "GALLERY, SOON."}</strong><p>New {tab === "reels" ? "video" : "photo"} studies will appear here when added to the project archive.</p></div>
      )}
      {shown < filtered.length && <button className="av-project-profile__load" type="button" onClick={() => setShown(n => n + 18)}>LOAD MORE <span>({filtered.length - shown} REMAINING)</span> ↓</button>}
      <footer className="av-project-profile__footer"><span>END OF PROJECT / {project.name}</span><Link href="/pro-jectz">RETURN TO PROJECTS ↑</Link></footer>
      {active && (
        <div className="av-project-viewer" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closePost(); }}>
          <div className="av-project-viewer__dialog" role="dialog" aria-modal="true" aria-label={`${active.kind} by ${project.name}`}>
            <div className="av-project-viewer__mobile-head"><span>{project.name}</span><button ref={closeRef} onClick={closePost} aria-label="Close viewer">CLOSE ×</button></div>
            <div className="av-project-viewer__media">
              {active.media[slide]?.kind === "video" ? (
                <video key={active.media[slide].src} src={active.media[slide].src} poster={active.media[slide].poster} controls playsInline preload="metadata" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.media[slide].src} alt={`${project.name} slide ${slide + 1} of ${active.media.length}`} />
              )}
              {active.media.length > 1 && <>
                <button className="av-project-viewer__previous" onClick={() => setSlide(n => (n - 1 + active.media.length) % active.media.length)} aria-label="Previous slide">‹</button>
                <button className="av-project-viewer__next" onClick={() => setSlide(n => (n + 1) % active.media.length)} aria-label="Next slide">›</button>
              </>}
            </div>
            <div className="av-project-viewer__aside">
              <div className="av-project-viewer__aside-top"><div className="av-project-viewer__tiny-avatar">{project.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase()}</div><div><strong>{project.name}</strong><span>ALTERED VENGANZA / WORK</span></div><button onClick={closePost} aria-label="Close viewer">×</button></div>
              <p>{active.caption}</p>
              <div className="av-project-viewer__bottom"><span>{active.kind.toUpperCase()}</span><span>{slide + 1} / {active.media.length}</span></div>
              {active.media.length > 1 && <div className="av-project-viewer__dots" aria-label="Carousel position">{active.media.map((item, i) => <button type="button" key={`${item.src}-${i}`} aria-label={`Go to slide ${i + 1}`} aria-current={slide === i ? "true" : undefined} onClick={() => setSlide(i)} />)}</div>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
