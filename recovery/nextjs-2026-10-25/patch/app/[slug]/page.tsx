import { notFound } from "next/navigation";
import { imagesFor } from "@/content/site";
import { projectProfiles } from "@/content/project-profiles";
import ProjectProfile from "@/components/ProjectProfile";

// These are the same client-project root routes used by the current live site.
export function generateStaticParams() {
  return Object.keys(projectProfiles).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectProfiles[slug];
  return project ? { title: `${project.name} — Altered Venganza`, description: project.bio } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectProfiles[slug];
  if (!project) notFound();
  return <ProjectProfile project={project} images={imagesFor(slug)} />;
}
