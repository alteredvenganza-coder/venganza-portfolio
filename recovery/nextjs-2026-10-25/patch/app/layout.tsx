import type { Metadata } from "next";
import Header from "@/components/Header";
import { InquiryProvider, InquiryCounter } from "@/components/InquiryProvider";
import Highlighter from "@/components/Highlighter";
import SoundGate from "@/components/SoundGate";
import { site } from "@/content/site";
import "./globals.css";
import "./software-menu.css";
import "./inquiry-services.css";
import "./project-profiles.css";
import "./sound-gate.css";
import "./highlight.css";

export const metadata: Metadata = {
  title: site.email,
  description: "Altered Venganza, design studio based in Trieste, Italy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Newsreader:ital,opsz,wght@0,6..72,300;1,6..72,300&family=Pinyon+Script&family=Space+Mono:wght@400;700&display=swap" />
      </head>
      <body>
        <InquiryProvider>
          <Header />
          <main className="main">{children}</main>
          <InquiryCounter />
          <SoundGate />
          <Highlighter />
        </InquiryProvider>
      </body>
    </html>
  );
}
