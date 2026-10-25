import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FilePlus2, MessageCircle, Minus, Send, ShieldCheck, X } from 'lucide-react';

const MAX_FILES = 3;
const MAX_BYTES = 2 * 1024 * 1024;
const readBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
  reader.onerror = () => reject(new Error('Cannot read attachment.'));
  reader.readAsDataURL(file);
});

export default function InquiriesCheckout({ items, removeItem, clearItems }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', budget: '', message: '', company: '' });
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [receipt, setReceipt] = useState(null);
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const emailFallback = 'mailto:studio@alteredvenganza.com?subject=' + encodeURIComponent('Studio inquiry — ' + (form.name || 'New project')) + '&body=' + encodeURIComponent(
    'Name: ' + form.name + '\nEmail: ' + form.email + '\nPhone: ' + (form.phone || 'Not provided') +
    '\nBudget: ' + form.budget + '\n\nServices:\n' +
    (items.map(s => '- ' + s.title + (s.tier ? ' (' + s.tier + ')' : '')).join('\n') || '- General inquiry') +
    '\n\nProject brief:\n' + form.message +
    (files.length ? '\n\nPlease manually attach these reference files: ' + files.map(f => f.name).join(', ') : '')
  );

  const addFiles = event => {
    const next = [...files, ...Array.from(event.target.files || [])];
    event.target.value = '';
    if (next.length > MAX_FILES) return setFileError('Maximum 3 attachments per inquiry.');
    if (next.some(f => !['image/jpeg','image/png','image/webp','application/pdf'].includes(f.type))) return setFileError('Only JPG, PNG, WEBP and PDF files are supported.');
    if (next.reduce((sum, f) => sum + f.size, 0) > MAX_BYTES) return setFileError('Attachments must be under 2 MB in total.');
    setFiles(next); setFileError('');
  };

  const submit = async e => {
    e.preventDefault();
    if (status.type === 'sending') return;
    setStatus({ type: 'sending', message: '' });
    try {
      const attachments = await Promise.all(files.map(async f => ({ name: f.name, mime: f.type, content: await readBase64(f) })));
      const res = await fetch('/api/inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          services: items.map(s => ({ title: s.title, tier: s.tier || '', priceDisplay: s.priceDisplay || '' })),
          attachments
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Unable to send the inquiry right now.');
      setReceipt({ code: data.reference, confirmed: data.confirmationSent, services: [...items], name: form.name, email: form.email });
      setStatus({ type: 'sent', message: '' });
      clearItems();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please retry.' });
    }
  };

  return (
    <main className="relative z-10 min-h-screen text-[#18242c] bg-gradient-to-br from-[#e5eaf0] via-[#f8fafb] to-[#d9e4e7] px-4 sm:px-8 pt-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
          <Link to="/services" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1c2933]/65 hover:text-black">
            <ArrowLeft size={14}/> Services
          </Link>
          <Link to="/" className="heading-font text-base sm:text-xl text-[#1b2227]">ALTERED VENGANZA</Link>
          <span className="hidden sm:flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-[#607578]"><span className="w-2 h-2 bg-emerald-500 rounded-full"/> Live inquire</span>
        </header>

        {receipt ? (
          <div className="max-w-2xl mx-auto rounded-[26px] border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_30px_100px_rgba(30,45,70,0.10)] p-8 sm:p-12">
            <div className="inline-flex rounded-full bg-emerald-100 text-emerald-800 p-3 mb-8"><Check size={24}/></div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#5f777a] mb-4">Inquire sent · receipt</p>
            <h1 className="serif-heading text-4xl sm:text-5xl text-[#142027]">We received your inquiry.</h1>
            <p className="text-sm text-[#52646c] mt-4 leading-relaxed">Thanks, {receipt.name}. Your request is on its way to the studio. This is not an order or a payment.</p>
            <div className="my-8 border-y border-dashed border-[#aab9bf] py-6 font-mono text-[11px] space-y-3">
              <div className="flex justify-between gap-5"><span className="text-[#7b8b91]">REFERENCE</span><strong>{receipt.code}</strong></div>
              <div className="flex justify-between gap-5"><span className="text-[#7b8b91]">EMAIL</span><span className="break-all text-right">{receipt.email}</span></div>
              <div className="flex justify-between gap-5"><span className="text-[#7b8b91]">SELECTED</span><span>{receipt.services.length || 'General inquiry'}</span></div>
              {receipt.services.map((s, i) => <div key={i} className="flex justify-between gap-5"><span>{s.title}</span><span className="text-[#798a92]">{s.tier || 'On request'}</span></div>)}
              <p className="text-[#70818a] pt-3">{receipt.confirmed ? 'A confirmation was emailed to you.' : 'Your request was sent. An automatic email copy could not be delivered.'}</p>
            </div>
            <Link to="/services" className="inline-flex gap-2 items-center px-6 py-4 bg-[#19262d] text-white font-mono text-[10px] uppercase tracking-wider">Explore services <ArrowRight size={13}/></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[0.84fr_1.16fr] gap-5 lg:gap-8 items-start">
            <div className="lg:sticky lg:top-6 rounded-[26px] overflow-hidden border border-white/60 bg-[linear-gradient(145deg,#93b6c7_0%,#d9eced_38%,#a4b5cb_75%,#7b98ad_100%)] shadow-[0_30px_80px_rgba(38,54,80,0.12)] p-5 sm:p-7 min-h-[390px] flex flex-col">
              <div className="flex items-center gap-3 border-b border-white/40 pb-5">
                <div className="w-11 h-11 bg-white/70 rounded-2xl flex items-center justify-center shadow-sm"><MessageCircle size={23} strokeWidth={1.5}/></div>
                <div><p className="font-semibold text-[#263c4b] text-[13px]">Altered Venganza / Studio</p><p className="font-mono text-[9px] text-[#446575] uppercase tracking-wider">Inquiries messenger · Welcome</p></div>
                <span className="ml-auto bg-white/65 rounded-full px-2 py-1 font-mono text-[9px] text-[#55757e]">OPEN</span>
              </div>
              <div className="flex flex-col gap-5 flex-1 pt-8">
                <div className="bg-white/70 rounded-[20px] rounded-tl-sm backdrop-blur-lg shadow-sm p-5 max-w-[88%] text-[14px] leading-relaxed text-[#2c4551]">
                  Hey, welcome to the studio. What can we make together?
                  <span className="block mt-2 font-mono text-[9px] uppercase tracking-wider text-[#77919a]">Studio · now</span>
                </div>
                <div className="bg-[#3f6274]/80 text-white rounded-[20px] rounded-tr-sm ml-auto p-4 max-w-[85%] text-[13px] leading-relaxed shadow-sm">
                  I’d like to inquire about {items.length ? items.map(s => s.title).join(', ') : 'a new project'}.
                </div>
                <div className="bg-white/70 rounded-[20px] rounded-tl-sm backdrop-blur-lg shadow-sm p-5 max-w-[90%] text-[13px] leading-relaxed text-[#2c4551]">
                  Fill out your brief and we’ll get back to you with availability, next steps and a tailored quote.
                  <span className="block mt-2 font-mono text-[9px] uppercase tracking-wider text-[#77919a]">No sign in needed · No payment</span>
                </div>
              </div>
              <div className="rounded-full border border-white/60 bg-white/35 backdrop-blur-md flex items-center justify-between px-5 py-4 mt-10 text-[11px] text-[#526e7a]">
                Compose your inquiry on the right <ArrowRight size={15}/>
              </div>
            </div>

            <form onSubmit={submit} className="rounded-[26px] border border-white/80 bg-white/90 shadow-[0_30px_100px_rgba(40,55,70,0.09)] backdrop-blur-xl p-5 sm:p-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#7b1f24] mb-3">Inquiry checkout / 01</p>
              <h1 className="serif-heading text-[2.6rem] sm:text-5xl text-[#18242c] leading-none">Build your inquiry.</h1>
              <p className="text-[#607078] text-sm mt-4 mb-8">Review your services and tell us what you need. No payment is collected.</p>

              <section aria-label="Selected services" className="border-y border-[#dce2e3] py-5 mb-8">
                <div className="flex items-center justify-between mb-4"><h2 className="font-mono uppercase text-[10px] tracking-widest text-[#516269]">Your selection</h2><span className="font-mono text-[10px] text-[#8a9ba1]">{items.length} selected</span></div>
                {items.length === 0 ? <p className="text-sm text-[#7a8b91] py-2">General project inquiry · <Link to="/services" className="underline underline-offset-4">Browse services</Link></p>
                  : <div className="space-y-3">{items.map((s, i) =>
                    <div key={s.title + i} className="flex gap-3 items-center bg-[#f4f6f5] border border-[#e5e9e7] p-3 rounded-lg">
                      <span className="w-11 h-11 bg-[#e4e3df] flex items-center justify-center font-mono text-[12px] text-[#738086] shrink-0">{String(i+1).padStart(2,'0')}</span>
                      <div className="min-w-0 flex-1"><p className="text-[13px] font-medium text-[#20323b]">{s.title}</p><p className="text-[10px] text-[#829097]">{s.tier || s.priceDisplay || 'Quote on request'}</p></div>
                      <button type="button" onClick={() => removeItem(i)} aria-label={'Remove ' + s.title} className="p-2 text-[#6f7e85] hover:text-[#7b1f24]"><X size={16}/></button>
                    </div>
                  )}</div>}
                <Link to="/services" className="inline-flex gap-2 items-center mt-4 font-mono text-[10px] text-[#7b1f24] hover:underline"><Minus size={12}/> Continue exploring services</Link>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                <label className="flex flex-col gap-2 text-[11px] text-[#52656d]">Name *<input required maxLength={120} value={form.name} onChange={e=>update('name',e.target.value)} autoComplete="name" className="p-3 border border-[#d6dddf] rounded-md bg-white text-[#1f2f38] outline-none focus:border-[#7b1f24]" placeholder="Your name"/></label>
                <label className="flex flex-col gap-2 text-[11px] text-[#52656d]">Email *<input required type="email" maxLength={200} value={form.email} onChange={e=>update('email',e.target.value)} autoComplete="email" className="p-3 border border-[#d6dddf] rounded-md bg-white text-[#1f2f38] outline-none focus:border-[#7b1f24]" placeholder="you@email.com"/></label>
                <label className="flex flex-col gap-2 text-[11px] text-[#52656d]">Phone <span className="text-[#9ba8ac] -mt-2">(optional)</span><input type="tel" maxLength={40} value={form.phone} onChange={e=>update('phone',e.target.value)} className="p-3 border border-[#d6dddf] rounded-md bg-white text-[#1f2f38] outline-none focus:border-[#7b1f24]" placeholder="+39 …"/></label>
                <label className="flex flex-col gap-2 text-[11px] text-[#52656d]">Estimated budget<select required value={form.budget} onChange={e=>update('budget',e.target.value)} className="p-3 border border-[#d6dddf] rounded-md bg-white text-[#1f2f38] outline-none focus:border-[#7b1f24]"><option value="">Select your budget</option><option>Under €500</option><option>€500–€1,000</option><option>€1,000–€2,500</option><option>€2,500–€5,000</option><option>€5,000+</option><option>Not sure yet</option></select></label>
              </div>
              <label className="flex flex-col gap-2 text-[11px] text-[#52656d] mt-5">Tell us about the project *<textarea required maxLength={5000} rows={5} value={form.message} onChange={e=>update('message',e.target.value)} className="p-3 border border-[#d6dddf] rounded-md bg-white text-[#1f2f38] outline-none focus:border-[#7b1f24] resize-y" placeholder="Goals, timeframe, references, what you're looking for…"/></label>
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.company} onChange={e=>update('company',e.target.value)} className="absolute left-[-9999px]" />
              <div className="mt-5">
                <div className="flex items-center justify-between"><p className="text-[11px] text-[#52656d]">References (optional)</p><p className="font-mono text-[9px] text-[#8a9ba1]">3 files · 2 MB total</p></div>
                <label className="flex items-center justify-center gap-2 border border-dashed border-[#c4d0d3] hover:border-[#7b1f24] bg-[#f7f9f9] rounded-lg py-5 mt-2 cursor-pointer font-mono text-[10px] text-[#6b818a]">
                  <FilePlus2 size={17}/> Attach JPG, PNG, WEBP or PDF
                  <input type="file" className="sr-only" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={addFiles}/>
                </label>
                {files.length > 0 && <div className="mt-3 space-y-1">{files.map((f,i)=><div key={i} className="flex justify-between gap-3 text-[11px] text-[#4b626c]"><span className="truncate">{f.name}</span><button type="button" onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))} aria-label={'Remove file '+f.name}><X size={14}/></button></div>)}</div>}
                {fileError && <p role="alert" className="text-red-700 text-[11px] mt-2">{fileError}</p>}
              </div>

              {status.type === 'error' && <div role="alert" className="mt-5 border border-red-200 bg-red-50 text-red-800 text-[12px] p-4 rounded-md">
                <p>{status.message}</p>
                <a href={emailFallback} className="inline-flex items-center gap-2 mt-3 font-semibold underline underline-offset-4">Open your email app to send manually <ArrowRight size={13}/></a>
                <p className="text-[11px] mt-2">Your email app will open with your brief. Review and send it there; reference files need to be attached manually.</p>
              </div>}
              <div className="border-t border-dashed border-[#bcc7cd] mt-8 pt-6">
                <div className="flex justify-between text-[12px] text-[#53656c] mb-4"><span>Amount due today</span><strong className="text-[#18242c] text-base">€0.00</strong></div>
                <button type="submit" disabled={status.type === 'sending'} className="w-full flex items-center justify-center gap-3 py-4 bg-[#7b1f24] text-white hover:bg-[#54191d] disabled:opacity-55 rounded-md font-mono uppercase tracking-[0.17em] text-[11px] transition-colors">
                  {status.type === 'sending' ? 'Sending inquiry…' : 'Send inquiry'} <Send size={15}/>
                </button>
                <p className="flex justify-center items-center gap-2 font-mono text-[9px] uppercase tracking-wide text-[#8a989b] mt-4"><ShieldCheck size={12}/> No account · No charge · Manual review by the studio</p>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
