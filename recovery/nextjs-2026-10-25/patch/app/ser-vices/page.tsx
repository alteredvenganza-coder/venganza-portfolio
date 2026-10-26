import Link from "next/link";
import { AddToInquiry } from "@/components/InquiryProvider";
import { SERVICES } from "@/content/services";

export const metadata = {
  title: "Services — Altered Venganza",
  description: "Creative direction, identity, clothing design, technical development and digital work by Altered Venganza.",
};

export default function ServicesPage() {
  return (
    <div className="av-services-page">
      <div className="av-services-eyebrow"><span>ALTERED VENGANZA / SERVICES</span><span>INDEX 01—06</span></div>
      <div className="av-services-heading">
        <h1>WHAT WE<br />DO<span>.</span></h1>
        <div><strong>Services, not templates.</strong><p>Choose a single service or collect several to build a project inquiry. Nothing is charged at this stage.</p></div>
      </div>
      <div className="av-services-tools">
        <span>STUDIO SERVICES / SELECTED DISCIPLINES</span>
        <Link href="/inquire">START A QUICK INQUIRY <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="av-services-grid">
        {SERVICES.map((service) => (
          <article className="av-service-tile" key={service.id}>
            <Link className="av-service-tile__image" href={`/ser-vices/${service.slug}`} aria-label={`Explore ${service.name}`}>
              {service.image ? <img src={service.image} alt={service.name} /> : <div className="av-service-placeholder" aria-hidden="true"><span>AV / SERVICE {service.index}</span><strong>IMAGE<br />{service.index}</strong><small>ASSET PLACEHOLDER / 4:5</small></div>}
            </Link>
            <div className="av-service-tile__metadata"><span>{service.category}</span><span>{service.index} / 06</span></div>
            <h2><Link href={`/ser-vices/${service.slug}`}>{service.name}</Link></h2>
            <p>{service.short}</p>
            <div className="av-service-tile__actions">
              <Link href={`/ser-vices/${service.slug}`}>EXPLORE <span aria-hidden="true">↗</span></Link>
              <AddToInquiry id={service.id} />
            </div>
          </article>
        ))}
      </div>
      <section className="av-services-endcap"><p>NOT SURE WHERE TO START?</p><h2>Tell us what you have in mind.</h2><Link href="/inquire">QUICK INQUIRY <span aria-hidden="true">↗</span></Link></section>
    </div>
  );
}
