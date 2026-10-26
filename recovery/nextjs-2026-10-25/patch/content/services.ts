/**
 * Public service catalogue. Each image is deliberately null until approved assets are uploaded.
 * Change the `image` field to a local /public path when the images are ready.
 */
export type Service = {
  id: string;
  slug: string;
  name: string;
  index: string;
  category: string;
  short: string;
  description: string;
  includes: string[];
  image: string | null;
};

export const SERVICES: Service[] = [
  {
    id: "brand-identity", slug: "brand-identity", index: "01", category: "IDENTITY / STRATEGY",
    name: "Brand Identity",
    short: "An identity system built to exist beyond a single launch.",
    description: "Naming direction, typography, logos, visual language and practical applications. A cohesive identity that grows with the brand, not a logo delivered in isolation.",
    includes: ["Brand positioning and visual direction", "Logo and typographic system", "Color, graphic and layout language", "Brand applications and delivery files"],
    image: null,
  },
  {
    id: "creative-direction", slug: "creative-direction", index: "02", category: "ART DIRECTION / CAMPAIGNS",
    name: "Creative Direction",
    short: "From the first reference to the final campaign.",
    description: "Creative concepts for collections, releases and campaigns. A clear visual idea developed into imagery, styling, references and production direction.",
    includes: ["Concept and visual research", "Moodboards and art direction", "Campaign planning", "Styling and production guidance"],
    image: null,
  },
  {
    id: "clothing-design", slug: "clothing-design", index: "03", category: "FASHION / GRAPHICS",
    name: "Clothing & Graphic Design",
    short: "Garments and graphics made for real-world production.",
    description: "Clothing concepts, graphics, print placements, embroidery directions and product development, with attention to the finished piece and its manufacturing constraints.",
    includes: ["Garment concepts and revisions", "Print and embroidery artwork", "Colorways and visual specifications", "Production-oriented assets"],
    image: null,
  },
  {
    id: "technical-production", slug: "technical-production", index: "04", category: "DEVELOPMENT / SPECIFICATIONS",
    name: "Tech Packs & Production",
    short: "Translate a creative idea into something a factory can understand.",
    description: "Technical drawings, material notes and structured production specifications for prototypes and manufacturing conversations.",
    includes: ["Technical flats", "Construction and placement notes", "Material and trim specifications", "Product development handoff"],
    image: null,
  },
  {
    id: "visual-production", slug: "visual-production", index: "05", category: "RENDERING / E-COMMERCE",
    name: "E-commerce Visuals",
    short: "Product imagery and visual assets for digital commerce.",
    description: "Visualizations for launches, product pages, flat lays, campaigns and creative presentations. The best method is chosen for the brief, not the other way around.",
    includes: ["Product and e-commerce visuals", "Digital mockups and flat lays", "Campaign-ready visual direction", "Export assets for online use"],
    image: null,
  },
  {
    id: "digital-experiences", slug: "digital-experiences", index: "06", category: "WEB / DIGITAL SYSTEMS",
    name: "Websites & Shopify",
    short: "Sites, storefronts and digital experiences with a point of view.",
    description: "Editorial websites, online stores and custom digital interactions. Designed around how your audience discovers, explores and buys what you make.",
    includes: ["Website or Shopify design", "Content and navigation architecture", "Product and collection UX", "Launch-ready responsive interfaces"],
    image: null,
  },
];

export function serviceBySlug(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}
