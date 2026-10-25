import React, { useMemo, useState } from 'react';
import { ArrowRight, Image as ImageIcon, LayoutGrid, List, Search, SlidersHorizontal, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const categoryOf = (title = '') => {
  if (/brand|drop|packaging|retainer/i.test(title)) return 'Identity';
  if (/techpack|tailored|premade/i.test(title)) return 'Apparel';
  return 'Visuals';
};

const startingPrice = (price = '') => {
  const n = [...String(price).matchAll(/€\s*([\d,.]+)/g)].map(v => Number(v[1].replace(/,/g, '')));
  return n.length ? Math.min(...n) : Number.POSITIVE_INFINITY;
};

const currency = (value) => Number.isFinite(value) ? 'From €' + value.toLocaleString('en-IE') : 'Quote on request';

const SERVICES_MARKS = ['SYS', 'FORM', 'VIS', 'TYPE', 'CRAFT', 'OBJ', '001', 'AV'];

export default function ServicesMarketplace({ services = [], onAdd, compact = false }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState('grid');

  const results = useMemo(() => {
    const words = query.toLocaleLowerCase().trim();
    const items = services.filter(s => (category === 'All' || categoryOf(s.title) === category)
      && (!words || (s.title + ' ' + (s.subtitle || '') + ' ' + (s.features || []).join(' ')).toLocaleLowerCase().includes(words)));
    if (sort === 'low') return [...items].sort((a, b) => startingPrice(a.price) - startingPrice(b.price));
    if (sort === 'high') return [...items].sort((a, b) => startingPrice(b.price) - startingPrice(a.price));
    return items;
  }, [services, query, category, sort]);

  return (
    <div className="text-black" aria-label="Services catalogue">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35 pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a service…" aria-label="Search services"
            className="w-full py-3 pl-11 pr-4 bg-white border border-black/15 rounded-md outline-none focus:border-[color:var(--primary)] text-sm placeholder:text-black/35" />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-black/40 shrink-0" />
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort services"
            className="flex-1 sm:flex-none px-3 py-3 bg-white border border-black/15 rounded-md font-mono text-[10px] tracking-wide text-black/70">
            <option value="featured">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
          </select>
          <div className="flex items-center p-1 rounded-md border border-black/10 bg-white" role="group" aria-label="View mode">
            <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}
              className={'p-2 rounded ' + (view === 'grid' ? 'bg-black text-white' : 'text-black/35 hover:text-black')}><LayoutGrid size={15}/></button>
            <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}
              className={'p-2 rounded ' + (view === 'list' ? 'bg-black text-white' : 'text-black/35 hover:text-black')}><List size={15}/></button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Service category">
        {['All', 'Identity', 'Apparel', 'Visuals'].map(c =>
          <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
            className={'rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ' +
              (category === c ? 'bg-black text-white border-black' : 'bg-white border-black/15 text-black/60 hover:border-black/50')}>
            {c}
          </button>
        )}
        <span className="ml-auto self-center font-mono text-[10px] text-black/40">{results.length} results</span>
      </div>
      {results.length === 0 ? <div className="py-20 text-center text-black/45 text-sm">No matching services. Try another search.</div> :
        <div className={view === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9'
          : 'flex flex-col divide-y divide-black/10 border-t border-black/10'}>
          {results.map((s, i) => {
            const price = startingPrice(s.price);
            const isList = view === 'list';
            return (
              <article key={s.title + i} className={'group min-w-0 ' + (isList ? 'flex gap-4 sm:gap-7 items-center py-5' : 'flex flex-col')}>
                <Link to={'/service/' + encodeURIComponent(s.title)} aria-label={'Details for ' + s.title}
                  className={'relative overflow-hidden bg-[#eeeeeb] border border-black/5 block shrink-0 ' +
                    (isList ? 'w-[112px] sm:w-[175px] aspect-square' : 'w-full aspect-[1/1.08]')}>
                  {s.image ? <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"/> :
                    <div className="h-full w-full flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-br from-[#deded9] via-[#f2f0ed] to-[#c8c7c1] text-[#48443e]">
                      <span className="font-mono text-[9px] tracking-[0.2em]">ALTERED / VENGANZA</span>
                      <div className="flex flex-col items-center justify-center flex-1">
                        <ImageIcon size={compact ? 17 : 24} strokeWidth={1} className="opacity-25 mb-3"/>
                        <strong className="heading-font text-2xl sm:text-3xl tracking-tighter opacity-60">{SERVICES_MARKS[i % SERVICES_MARKS.length]}</strong>
                      </div>
                      <span className="font-mono text-[9px] tracking-wider opacity-50">IMAGE PLACEHOLDER / {String(i + 1).padStart(2,'0')}</span>
                    </div>}
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-black/60">{categoryOf(s.title)}</span>
                </Link>
                <div className={'flex flex-col min-w-0 flex-1 ' + (isList ? '' : 'pt-3')}>
                  <Link to={'/service/' + encodeURIComponent(s.title)} className="font-semibold text-[13px] sm:text-[15px] leading-tight text-black hover:underline underline-offset-4">
                    {s.title}
                  </Link>
                  <p className={'text-black/50 text-[11px] sm:text-xs leading-snug mt-1 ' + (isList ? 'line-clamp-2' : 'line-clamp-2 min-h-[2.5em]')}>{s.subtitle}</p>
                  <p className="font-semibold text-black text-[14px] sm:text-[16px] mt-3">{currency(price)}</p>
                  <p className="font-mono text-[9px] text-black/45 mt-1">{s.delivery} · Indicative pricing</p>
                  <button type="button" onClick={() => onAdd(s)}
                    className="mt-4 w-full sm:w-auto self-start flex justify-center items-center gap-2 border border-black bg-black text-white hover:bg-[color:var(--primary)] hover:border-[color:var(--primary)] px-3 sm:px-4 py-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.12em] transition-colors">
                    <Plus size={13}/> Add to Inquire <ArrowRight size={12}/>
                  </button>
                </div>
              </article>
            );
          })}
        </div>}
    </div>
  );
}
