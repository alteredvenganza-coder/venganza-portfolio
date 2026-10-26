/**
 * P'RO-JECTZ — editable profile metadata.
 * Only list public links that belong to the project. Do not infer a client URL.
 * Existing imagery is loaded by `imagesFor(slug)` from the live site's image registry.
 * New video reels: place approved MP4 files in public/media/projects/<slug>/.
 */
export type ProjectReel = {
  src: string;
  poster?: string;
  caption?: string;
};

export type ProjectConfig = {
  slug: string;
  name: string;
  handle: string;
  category: string;
  bio: string;
  website?: string;
  profileImage?: string;
  reels: ProjectReel[];
};

export const projectProfiles: Record<string, ProjectConfig> = {
  "04-studios": {
    slug: "04-studios",
    name: "[04]-STUDIOS™",
    handle: "04.studios",
    category: "Fashion / Visual Identity",
    bio: "An independent fashion label. Selected work from the visual world of [04]-STUDIOS™.",
    website: "https://04-studios.com",
    reels: [],
  },
  "sanera-houston": {
    slug: "sanera-houston",
    name: "SANERA HOUSTON",
    handle: "sanera.houston",
    category: "Selected client project",
    bio: "Images, studies and visual development selected for this project.",
    reels: [],
  },
  "victory-plus": {
    slug: "victory-plus",
    name: "VICTORY PLUS",
    handle: "victory.plus",
    category: "Selected client project",
    bio: "A closer look at the project's creative output and visual details.",
    reels: [],
  },
  "78p": {
    slug: "78p",
    name: "78p",
    handle: "78p.project",
    category: "Selected client project",
    bio: "Selected images and details from the project's visual archive.",
    reels: [],
  },
  "atomic-studios": {
    slug: "atomic-studios",
    name: "Atomic Studios",
    handle: "atomic.studios",
    category: "Selected client project",
    bio: "A selection of the visual work developed for this client.",
    reels: [],
  },
};

export type ProjectAsset = { kind: "image" | "video"; src: string; poster?: string };
export type ProjectPost = { id: string; kind: "photo" | "carousel" | "reel"; caption: string; media: ProjectAsset[] };

/** Existing photos stay in their original order; grouped as single photos + carousels. */
export function getProjectPosts(config: ProjectConfig, images: string[]): ProjectPost[] {
  const posts: ProjectPost[] = [];
  let index = 0;
  while (index < images.length) {
    const single = posts.length % 3 === 0 || images.length - index < 3;
    const chunk = images.slice(index, index + (single ? 1 : 3));
    index += chunk.length;
    posts.push({
      id: `photo-${posts.length + 1}`,
      kind: chunk.length > 1 ? "carousel" : "photo",
      caption: `${config.name} — Visual archive / ${String(posts.length + 1).padStart(2, "0")}`,
      media: chunk.map(src => ({ kind: "image", src })),
    });
  }
  config.reels.forEach((reel, i) => {
    posts.push({
      id: `reel-${i + 1}`,
      kind: "reel",
      caption: reel.caption ?? `${config.name} — Moving images`,
      media: [{ kind: "video", src: reel.src, poster: reel.poster }],
    });
  });
  return posts;
}
