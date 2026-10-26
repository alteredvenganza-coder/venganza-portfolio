import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToInquiry } from "@/components/InquiryProvider";
import { SERVICES, serviceBySlug } from "@/content/services";

export function generateStaticParams() { return SERVICES.map((service) => ({ slug: service.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  return { title: `${service?.name || "Service"} — Altered Venganza`, description: service?.short };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  return (
    <article className="av-service-detail-page">
      <div className="av-services-eyebrow"><Link href="/ser-vices">← ALL SERVICES</Link><span>{service.index} / 06 — {service.category}</span></div>
      <div className="av-service-detail-head"><div><p>ALTERED VENGANZA / WHAT WE DO</p><h1>{service.name}<span>.</span></h1><p className="av-service-detail-lead">{service.short}</p></div><div className="av-service-detail-image">{service.image ? <img src={service.image} alt={service.name} /> : <div className="av-service-placeholder"><span>AV / SERVICE {service.index}</span><strong>IMAGE<br />{service.index}</strong><small>YOUR IMAGE GOES HERE</small></div>}</div></div>
      <div className="av-service-detail-content"><div><p className="av-overline">THE IDEA</p><h2>Built around<br />your brief.</h2></div><div><p>{service.description}</p><p className="av-overline">POSSIBLE DELIVERABLES</p><ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul><div className="av-service-detail-actions"><AddToInquiry id={service.id} large /><Link href="/inquire" className="av-service-inquire-now">CONTINUE TO INQUIRY ↗</Link></div><small>The selected service is not a purchase or a binding quote. The scope and budget are confirmed after reviewing your request.</small></div></div>
    </article>
  );
}
