import ProjectsBoard, { type BoardItem, type WorkType } from "@/components/ProjectsBoard";
import { imagesFor } from "@/content/site";

const items: BoardItem[] = [
  { slug: "04-studios", title: "[04]-STUDIOS", types: ["web", "design", "brand identity"], year: 2026, cover: imagesFor("04-studios")[0] },
  { slug: "sanera-houston", title: "SANERA HOUSTON", types: ["web", "brand identity"], year: null, cover: imagesFor("sanera-houston")[0] },
  { slug: "victory-plus", title: "VICTORY PLUS", types: ["web", "design"], year: null, cover: imagesFor("victory-plus")[0] },
  { slug: "78p", title: "78P", types: ["design", "brand identity"], year: null, cover: imagesFor("78p")[0] },
  { slug: "atomic-studios", title: "ATOMIC STUDIOS", types: ["web", "design"], year: null, cover: imagesFor("atomic-studios")[0] },
];
const types: WorkType[] = ["web", "design", "brand identity"];
export default function Projects() {
  return <ProjectsBoard items={items} types={types} eyebrow="P’RO-JECTZ / SELECTED WORK" />;
}
