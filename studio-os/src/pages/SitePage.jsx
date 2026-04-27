import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Briefcase, Layers, Package, FileText, ExternalLink } from 'lucide-react';
import ThemeTab from './site/ThemeTab';
import CaseStudiesTab from './site/CaseStudiesTab';
import ServicesTab from './site/ServicesTab';
import PremadesTab from './site/PremadesTab';
import ContentTab from './site/ContentTab';

const TABS = [
  { id: 'theme',        label: 'Theme',        icon: Palette,   Component: ThemeTab },
  { id: 'casestudies',  label: 'Case Studies', icon: Briefcase, Component: CaseStudiesTab },
  { id: 'services',     label: 'Services',     icon: Layers,    Component: ServicesTab },
  { id: 'premades',     label: 'Premades',     icon: Package,   Component: PremadesTab },
  { id: 'content',      label: 'Content',      icon: FileText,  Component: ContentTab },
];

const SITE_URL = 'https://alteredvenganza.com';

export default function SitePage() {
  const [tab, setTab] = useState('theme');
  const Active = TABS.find(t => t.id === tab)?.Component || ThemeTab;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 relative z-10">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-1 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">Sito</h1>
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="label-meta hover:text-burgundy-muted inline-flex items-center gap-1 transition-colors">
            alteredvenganza.com <ExternalLink size={11} />
          </a>
        </div>
        <p className="text-sm text-muted">Theme, case studies, services, premades and homepage copy.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/8 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors whitespace-nowrap relative ${
              tab === id ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
            {tab === id && (
              <motion.span layoutId="site-tab-underline" className="absolute bottom-0 left-0 right-0 h-px bg-burgundy" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        <Active />
      </div>
    </div>
  );
}
