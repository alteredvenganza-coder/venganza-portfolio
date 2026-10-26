import EditorialAbout from "@/components/EditorialAbout";
import { about, imagesFor } from "@/content/site";

export default function AlteredVenganza() {
  return <EditorialAbout
    title={about.title}
    meta={about.meta}
    paragraphs={about.paragraphs}
    inquireLabel={about.inquireLabel}
    inquireLink={about.inquireLink}
    meetLabel={about.meet.label}
    meetHref="/inquire"
    meetParagraphs={about.meet.paragraphs}
    portrait={imagesFor("altered-venganza")[0]}
  />;
}
